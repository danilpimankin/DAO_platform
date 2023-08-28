import { task } from 'hardhat/config'
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task('withdraw', 'Withdraw deposit')
    .addParam('amout', 'withdrawable tokens amount')
	.setAction(async ({ amount }, { ethers }) => {
        let platform = "0xE793f9229eAc4693E2Bbcb9549f264445d0DEed9"
        let token = "0x50d7222306D973E4347f67Ef701b6718e07f0783"

        const Platform = await ethers.getContractFactory('DAO')
        const daoPlatform = Platform.attach(platform)

        const Token = await ethers.getContractFactory('MyToken')
        const daoToken = Token.attach(token)
        try{ 
            const contractTx2: ContractTransaction = await daoPlatform.withdrawDeposit(amount);
            const contractReceipt: ContractReceipt = await contractTx2.wait();
            const event = contractReceipt.events?.find(event => event.event === 'WithdrawedDeposit');
            const eBuyer: Address = event?.args!['sender'];
            const eAmount: BigNumber = event?.args!['tokenAmount'];            
            console.log(`${eBuyer} successful withdraw of ${eAmount} ICO tokens!`)
        }catch(error: any) {
            console.log("ERROR:", error["reason"]);
        }
    })