import { task } from 'hardhat/config'
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task('deposit', 'Deposit tokens')
    .addParam('amount', 'depositable tokens amount')
	.setAction(async ({amount}, { ethers }) => {
        let platform = "0xE793f9229eAc4693E2Bbcb9549f264445d0DEed9"
        let token = "0x50d7222306D973E4347f67Ef701b6718e07f0783"

        const Platform = await ethers.getContractFactory('DAO')
        const daoPlatform = Platform.attach(platform)

        const Token = await ethers.getContractFactory('MyToken')
        const daoToken = Token.attach(token)

        const contractTx1: ContractTransaction = await daoToken.approve(daoPlatform.address, amount);
        await contractTx1.wait();

        try
        { 
            const contractTx2: ContractTransaction = await daoPlatform.addDeposit(amount);
            const contractReceipt: ContractReceipt = await contractTx2.wait();
            const event = contractReceipt.events?.find(event => event.event === 'AddedDeposit');
            const eBuyer: Address = event?.args!['sender'];
            const eAmount: BigNumber = event?.args!['tokenAmount'];            
            console.log(`${eBuyer} successful deposit of ${eAmount} ICO tokens!`)
        }catch(error: any) {
            console.log("ERROR:", error["reason"]);
        }
    })