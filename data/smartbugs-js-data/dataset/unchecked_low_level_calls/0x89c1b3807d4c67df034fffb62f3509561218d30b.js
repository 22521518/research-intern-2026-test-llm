class TownCrier {
    constructor() {
        this.SGX_ADDRESS = "0x18513702cCd928F2A3eb63d900aDf03c9cc81593";
        this.GAS_PRICE = 50000000000n;
        this.MIN_FEE = 30000n * this.GAS_PRICE;
        this.CANCELLATION_FEE = 25000n * this.GAS_PRICE;
        this.CANCELLED_FEE_FLAG = 1n;
        this.DELIVERED_FEE_FLAG = 0n;
        this.FAIL_FLAG = -(2n ** 250n);
        this.SUCCESS_FLAG = 1n;
        this.killswitch = false;
        this.externalCallFlag = false;
        this.requestCnt = 0n;
        this.unrespondedCnt = 0n;
        this.requests = {}; // [SIMULATED: Request[2**64]]
        this.newVersion = 0n;
        
        this.requestCnt = 1n;
        this.requests[0n] = { requester: msg_sender }; // [SIMULATED: msg.sender]
        this.killswitch = false;
        this.unrespondedCnt = 0n;
        this.externalCallFlag = false;
    }

    // Contracts that receive Ether but do not define a fallback function throw
    // an exception, sending back the Ether (this was different before Solidity
    // v0.4.0). So if you want your contract to receive Ether, you have to
    // implement a fallback function.
    fallback() {}

    upgrade(newAddr, msg_sender) {
        if (msg_sender == this.requests[0n].requester && this.unrespondedCnt == 0n) {
            this.newVersion = -BigInt(newAddr);
            this.killswitch = true;
            console.log("Upgrade", newAddr);
        }
    }

    reset(price, minGas, cancellationGas, msg_sender) {
        if (msg_sender == this.requests[0n].requester && this.unrespondedCnt == 0n) {
            this.GAS_PRICE = price;
            this.MIN_FEE = price * minGas;
            this.CANCELLATION_FEE = price * cancellationGas;
            console.log("Reset", this.GAS_PRICE, this.MIN_FEE, this.CANCELLATION_FEE);
        }
    }

    suspend(msg_sender) {
        if (msg_sender == this.requests[0n].requester) {
            this.killswitch = true;
        }
    }

    restart(msg_sender) {
        if (msg_sender == this.requests[0n].requester && this.newVersion == 0n) {
            this.killswitch = false;
        }
    }

    withdraw(msg_sender, balance) {
        if (msg_sender == this.requests[0n].requester && this.unrespondedCnt == 0n) {
            if (!this.requests[0n].requester.call(balance)) {
                throw new Error("Transaction failed");
            }
        }
    }

    request(requestType, callbackAddr, callbackFID, timestamp, requestData, msg_sender, msg_value) {
        if (this.externalCallFlag) {
            throw new Error("External call in progress");
        }

        if (this.killswitch) {
            this.externalCallFlag = true;
            if (!msg_sender.call(msg_value)) {
                throw new Error("Refund failed");
            }
            this.externalCallFlag = false;
            return this.newVersion;
        }

        if (msg_value < this.MIN_FEE) {
            this.externalCallFlag = true;
            // If the amount of ether sent by the requester is too little or 
            // too much, refund the requester and discard the request.
            if (!msg_sender.call(msg_value)) {
                throw new Error("Refund failed");
            }
            this.externalCallFlag = false;
            return this.FAIL_FLAG;
        } else {
            // Record the request.
            let requestId = this.requestCnt;
            this.requestCnt++;
            this.unrespondedCnt++;

            let paramsHash = sha3(requestType, requestData); // [SIMULATED: sha3]
            this.requests[Number(requestId)] = {
                requester: msg_sender,
                fee: msg_value,
                callbackAddr: callbackAddr,
                callbackFID: callbackFID,
                paramsHash: paramsHash
            };

            // Log the request for the Town Crier server to process.
            console.log("RequestInfo", requestId, requestType, msg_sender, msg_value, callbackAddr, paramsHash, timestamp, requestData);
            return requestId;
        }
    }

    deliver(requestId, paramsHash, error, respData, msg_sender, tx_gasprice, msg_gas) {
        if (msg_sender != this.SGX_ADDRESS ||
                requestId <= 0n ||
                this.requests[Number(requestId)].requester == "0x0" ||
                this.requests[Number(requestId)].fee == this.DELIVERED_FEE_FLAG) {
            // If the response is not delivered by the SGX account or the 
            // request has already been responded to, discard the response.
            return;
        }

        let fee = this.requests[Number(requestId)].fee;
        if (this.requests[Number(requestId)].paramsHash != paramsHash) {
            // If the hash of request parameters in the response is not 
            // correct, discard the response for security concern.
            return;
        } else if (fee == this.CANCELLED_FEE_FLAG) {
            // If the request is cancelled by the requester, cancellation 
            // fee goes to the SGX account and set the request as having
            // been responded to.
            //
            this.SGX_ADDRESS.send(this.CANCELLATION_FEE);
            this.requests[Number(requestId)].fee = this.DELIVERED_FEE_FLAG;
            this.unrespondedCnt--;
            return;
        }

        this.requests[Number(requestId)].fee = this.DELIVERED_FEE_FLAG;
        this.unrespondedCnt--;

        if (error < 2n) {
            // Either no error occurs, or the requester sent an invalid query.
            // Send the fee to the SGX account for its delivering.
            //
            this.SGX_ADDRESS.send(fee);         
        } else {
            // Error in TC, refund the requester.
            this.externalCallFlag = true;
            //
            this.requests[Number(requestId)].requester.call(fee);
            this.externalCallFlag = false;
        }

        let callbackGas = (fee - this.MIN_FEE) / tx_gasprice; // gas left for the callback function
        console.log("DeliverInfo", requestId, fee, tx_gasprice, msg_gas, callbackGas, paramsHash, error, respData); // log the response information
        if (callbackGas > msg_gas - 5000n) {
            callbackGas = msg_gas - 5000n;
        }
        
        this.externalCallFlag = true;
        //
        this.requests[Number(requestId)].callbackAddr.call(this.requests[Number(requestId)].callbackFID, requestId, error, respData); // call the callback function in the application contract
        this.externalCallFlag = false;
    }

    cancel(requestId, msg_sender) {
        if (this.externalCallFlag) {
            throw new Error("External call in progress");
        }

        if (this.killswitch) {
            return 0n;
        }

        let fee = this.requests[Number(requestId)].fee;
        if (this.requests[Number(requestId)].requester == msg_sender && fee >= this.CANCELLATION_FEE) {
            // If the request was sent by this user and has money left on it,
            // then cancel it.
            this.requests[Number(requestId)].fee = this.CANCELLED_FEE_FLAG;
            this.externalCallFlag = true;
            if (!msg_sender.call(fee - this.CANCELLATION_FEE)) {
                throw new Error("Refund failed");
            }
            this.externalCallFlag = false;
            console.log("Cancel", requestId, msg_sender, this.requests[Number(requestId)].requester, this.requests[Number(requestId)].fee, 1n);
            return this.SUCCESS_FLAG;
        } else {
            console.log("Cancel", requestId, msg_sender, this.requests[Number(requestId)].requester, fee, -1n);
            return this.FAIL_FLAG;
        }
    }
}