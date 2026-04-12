"""Concurrent request queue for Google AI calls with atomic in-flight tracking.

This data structure is designed for slow API responses where you want to keep
dispatching requests as long as limits are not exceeded:
- max in-flight requests at the same time
- max requests per minute (rolling 60-second window)

Typical flow:
1) Producer puts payloads into the queue.
2) Dispatcher/worker threads call ``take_ready()``.
3) After each API response (success/error), call ``mark_done()``.
"""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from typing import Deque, Generic, Optional, TypeVar
import threading
import time


T = TypeVar("T")


class AtomicCounter:
    """A minimal lock-based atomic counter."""

    def __init__(self, initial: int = 0) -> None:
        self._value = int(initial)
        self._lock = threading.Lock()

    def get(self) -> int:
        with self._lock:
            return self._value

    def increment(self, amount: int = 1) -> int:
        if amount < 0:
            raise ValueError("amount must be >= 0")
        with self._lock:
            self._value += amount
            return self._value

    def decrement(self, amount: int = 1) -> int:
        if amount < 0:
            raise ValueError("amount must be >= 0")
        with self._lock:
            if self._value < amount:
                raise ValueError("counter cannot go below zero")
            self._value -= amount
            return self._value


@dataclass(frozen=True)
class DispatchQueueStats:
    pending: int
    in_flight: int
    max_in_flight: int
    requests_per_minute: int
    sent_in_current_window: int
    closed: bool


class GoogleAIRequestQueue(Generic[T]):
    """Thread-safe queue that gates dispatch by in-flight and RPM limits.

    - ``put(item)``: enqueue a new request payload.
    - ``take_ready()``: block until an item is allowed to be sent, then pop it.
    - ``mark_done()``: call when a response is received to free one in-flight slot.
    """

    WINDOW_SECONDS = 60.0

    def __init__(self, max_in_flight: int, requests_per_minute: int) -> None:
        if max_in_flight < 1:
            raise ValueError("max_in_flight must be >= 1")
        if requests_per_minute < 1:
            raise ValueError("requests_per_minute must be >= 1")

        self.max_in_flight = int(max_in_flight)
        self.requests_per_minute = int(requests_per_minute)

        self._pending: Deque[T] = deque()
        self._sent_timestamps: Deque[float] = deque()
        self._in_flight = AtomicCounter(0)

        self._lock = threading.Lock()
        self._cv = threading.Condition(self._lock)
        self._closed = False

    def put(self, item: T) -> None:
        with self._cv:
            if self._closed:
                raise RuntimeError("queue is closed")
            self._pending.append(item)
            self._cv.notify_all()

    def close(self) -> None:
        with self._cv:
            self._closed = True
            self._cv.notify_all()

    def take_ready(self, timeout: Optional[float] = None) -> Optional[T]:
        """Return next dispatchable item or None on timeout/closed-empty queue.

        This method only pops an item when both conditions are true:
        - in_flight < max_in_flight
        - sent_in_last_60s < requests_per_minute
        """

        if timeout is not None and timeout < 0:
            raise ValueError("timeout must be >= 0")

        deadline = None if timeout is None else time.monotonic() + timeout

        with self._cv:
            while True:
                now = time.monotonic()
                self._trim_rate_window(now)

                has_pending = bool(self._pending)
                in_flight = self._in_flight.get()
                has_in_flight_slot = in_flight < self.max_in_flight
                has_rate_slot = len(self._sent_timestamps) < self.requests_per_minute

                if has_pending and has_in_flight_slot and has_rate_slot:
                    item = self._pending.popleft()
                    self._in_flight.increment()
                    self._sent_timestamps.append(now)
                    return item

                if self._closed and not self._pending:
                    return None

                remaining = None
                if deadline is not None:
                    remaining = deadline - now
                    if remaining <= 0:
                        return None

                rate_wait = None
                if has_pending and has_in_flight_slot and not has_rate_slot:
                    rate_wait = self._seconds_until_rate_slot(now)

                wait_time = self._min_wait(remaining, rate_wait)
                self._cv.wait(wait_time)

    def mark_done(self, done_count: int = 1) -> int:
        """Decrease in-flight count when response(s) are completed."""

        if done_count < 1:
            raise ValueError("done_count must be >= 1")

        with self._cv:
            current = self._in_flight.get()
            if current < done_count:
                raise ValueError("done_count is larger than in-flight count")
            new_value = self._in_flight.decrement(done_count)
            self._cv.notify_all()
            return new_value

    def stats(self) -> DispatchQueueStats:
        with self._cv:
            self._trim_rate_window(time.monotonic())
            return DispatchQueueStats(
                pending=len(self._pending),
                in_flight=self._in_flight.get(),
                max_in_flight=self.max_in_flight,
                requests_per_minute=self.requests_per_minute,
                sent_in_current_window=len(self._sent_timestamps),
                closed=self._closed,
            )

    @staticmethod
    def _min_wait(a: Optional[float], b: Optional[float]) -> Optional[float]:
        if a is None:
            return b
        if b is None:
            return a
        return min(a, b)

    def _seconds_until_rate_slot(self, now: float) -> Optional[float]:
        if len(self._sent_timestamps) < self.requests_per_minute:
            return None
        oldest = self._sent_timestamps[0]
        return max(0.0, self.WINDOW_SECONDS - (now - oldest))

    def _trim_rate_window(self, now: float) -> None:
        cutoff = now - self.WINDOW_SECONDS
        while self._sent_timestamps and self._sent_timestamps[0] <= cutoff:
            self._sent_timestamps.popleft()


__all__ = ["AtomicCounter", "DispatchQueueStats", "GoogleAIRequestQueue"]
