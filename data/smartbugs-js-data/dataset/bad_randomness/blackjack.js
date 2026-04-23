/*




 */

class Deck {
	// returns random number from 0 to 51
	// let's say 'value' % 4 means suit (0 - Hearts, 1 - Spades, 2 - Diamonds, 3 - Clubs)
	//			 'value' / 4 means: 0 - King, 1 - Ace, 2 - 10 - pip values, 11 - Jacket, 12 - Queen

	static deal(player, cardNumber, blockNumber, blockTimestamp, blockHash) {
		//
		let b = blockNumber;
		//
		let timestamp = blockTimestamp;
		//
		return Number(BigInt(keccak256(blockHash, player, cardNumber, timestamp)) % 52n); // [SIMULATED: keccak256]
	}

	static valueOf(card, isBigAce) {
		let value = Math.floor(card / 4);
		if (value === 0 || value === 11 || value === 12) { // Face cards
			return 10;
		}
		if (value === 1 && isBigAce) { // Ace is worth 11
			return 11;
		}
		return value;
	}

	static isAce(card) {
		return Math.floor(card / 4) === 1;
	}

	static isTen(card) {
		return Math.floor(card / 4) === 10;
	}
}


class BlackJack {
	constructor() {
		this.minBet = 50000000000000000n; // 0.05 eth
		this.maxBet = 5000000000000000000n;
		this.BLACKJACK = 21;
		this.GameState = { Ongoing: 0, Player: 1, Tie: 2, House: 3 };
		this.games = {};
	}

	// starts a new game
	deal(msgSender, msgValue) {
		if (this.games[msgSender] && this.games[msgSender].player !== "0" && this.games[msgSender].state === this.GameState.Ongoing) {
			throw new Error("game is already going on");
		}

		if (msgValue < this.minBet || msgValue > this.maxBet) {
			throw new Error("incorrect bet");
		}

		let houseCards = new Array(1);
		let playerCards = new Array(2);

		// deal the cards
		playerCards[0] = Deck.deal(msgSender, 0n, 0n, 0n, ""); // [SIMULATED: block context]
		console.log("Deal", true, playerCards[0]);
		houseCards[0] = Deck.deal(msgSender, 1n, 0n, 0n, "");
		console.log("Deal", false, houseCards[0]);
		playerCards[1] = Deck.deal(msgSender, 2n, 0n, 0n, "");
		console.log("Deal", true, playerCards[1]);

		this.games[msgSender] = {
			player: msgSender,
			bet: msgValue,
			houseCards: houseCards,
			playerCards: playerCards,
			state: this.GameState.Ongoing,
			cardsDealt: 3n
		};

		this.checkGameResult(this.games[msgSender], false, msgSender);
	}

	// deals one more card to the player
	hit(msgSender) {
		if (this.games[msgSender].player === "0" || this.games[msgSender].state !== this.GameState.Ongoing) {
			throw new Error("game doesn't exist or already finished");
		}
		let nextCard = this.games[msgSender].cardsDealt;
		this.games[msgSender].playerCards.push(Deck.deal(msgSender, nextCard, 0n, 0n, ""));
		this.games[msgSender].cardsDealt = nextCard + 1n;
		console.log("Deal", true, this.games[msgSender].playerCards[Number(BigInt(this.games[msgSender].playerCards.length) - 1n)]);
		this.checkGameResult(this.games[msgSender], false, msgSender);
	}

	// finishes the game
	stand(msgSender) {
		if (this.games[msgSender].player === "0" || this.games[msgSender].state !== this.GameState.Ongoing) {
			throw new Error("game doesn't exist or already finished");
		}

		let [houseScore, houseScoreBig] = this.calculateScore(this.games[msgSender].houseCards);

		while (houseScoreBig < 17) {
			let nextCard = this.games[msgSender].cardsDealt;
			let newCard = Deck.deal(msgSender, nextCard, 0n, 0n, "");
			this.games[msgSender].houseCards.push(newCard);
			this.games[msgSender].cardsDealt = nextCard + 1n;
			houseScoreBig += Deck.valueOf(newCard, true);
			console.log("Deal", false, newCard);
		}

		this.checkGameResult(this.games[msgSender], true, msgSender);
	}

	// @param finishGame - whether to finish the game or not (in case of Blackjack the game finishes anyway)
	checkGameResult(game, finishGame, msgSender) {
		// calculate house score
		let [houseScore, houseScoreBig] = this.calculateScore(game.houseCards);
		// calculate player score
		let [playerScore, playerScoreBig] = this.calculateScore(game.playerCards);

		console.log("GameStatus", houseScore, houseScoreBig, playerScore, playerScoreBig);

		if (houseScoreBig === this.BLACKJACK || houseScore === this.BLACKJACK) {
			if (playerScore === this.BLACKJACK || playerScoreBig === this.BLACKJACK) {
				// TIE
				if (!this.send(msgSender, game.bet)) throw new Error("send failed"); // return bet to the player
				this.games[msgSender].state = this.GameState.Tie; // finish the game
				return;
			} else {
				// HOUSE WON
				this.games[msgSender].state = this.GameState.House; // simply finish the game
				return;
			}
		} else {
			if (playerScore === this.BLACKJACK || playerScoreBig === this.BLACKJACK) {
				// PLAYER WON
				if (game.playerCards.length === 2 && (Deck.isTen(game.playerCards[0]) || Deck.isTen(game.playerCards[1]))) {
					// Natural blackjack => return x2.5
					if (!this.send(msgSender, (game.bet * 5n) / 2n)) throw new Error("send failed"); // send prize to the player
				} else {
					// Usual blackjack => return x2
					if (!this.send(msgSender, game.bet * 2n)) throw new Error("send failed"); // send prize to the player
				}
				this.games[msgSender].state = this.GameState.Player; // finish the game
				return;
			} else {

				if (playerScore > this.BLACKJACK) {
					// BUST, HOUSE WON
					console.log("Log", 1);
					this.games[msgSender].state = this.GameState.House; // finish the game
					return;
				}

				if (!finishGame) {
					return; // continue the game
				}

                // недобор
				let playerShortage = 0;
				let houseShortage = 0;

				// player decided to finish the game
				if (playerScoreBig > this.BLACKJACK) {
					if (playerScore > this.BLACKJACK) {
						// HOUSE WON
						this.games[msgSender].state = this.GameState.House; // simply finish the game
						return;
					} else {
						playerShortage = this.BLACKJACK - playerScore;
					}
				} else {
					playerShortage = this.BLACKJACK - playerScoreBig;
				}

				if (houseScoreBig > this.BLACKJACK) {
					if (houseScore > this.BLACKJACK) {
						// PLAYER WON
						if (!this.send(msgSender, game.bet * 2n)) throw new Error("send failed"); // send prize to the player
						this.games[msgSender].state = this.GameState.Player;
						return;
					} else {
						houseShortage = this.BLACKJACK - houseScore;
					}
				} else {
					houseShortage = this.BLACKJACK - houseScoreBig;
				}

                // ?????????????????????? почему игра заканчивается?
				if (houseShortage === playerShortage) {
					// TIE
					if (!this.send(msgSender, game.bet)) throw new Error("send failed"); // return bet to the player
					this.games[msgSender].state = this.GameState.Tie;
				} else if (houseShortage > playerShortage) {
					// PLAYER WON
					if (!this.send(msgSender, game.bet * 2n)) throw new Error("send failed"); // send prize to the player
					this.games[msgSender].state = this.GameState.Player;
				} else {
					this.games[msgSender].state = this.GameState.House;
				}
			}
		}
	}

	calculateScore(cards) {
		let score = 0;
		let scoreBig = 0; // in case of Ace there could be 2 different scores
		let bigAceUsed = false;
		for (let i = 0; i < cards.length; ++i) {
			let card = cards[i];
			if (Deck.isAce(card) && !bigAceUsed) { // doesn't make sense to use the second Ace as 11, because it leads to the losing
				scoreBig += Deck.valueOf(card, true);
				bigAceUsed = true;
			} else {
				scoreBig += Deck.valueOf(card, false);
			}
			score += Deck.valueOf(card, false);
		}
		return [score, scoreBig];
	}

	send(to, amount) { return true; } // [SIMULATED: address.send]
}