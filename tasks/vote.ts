import { task } from 'hardhat/config'
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task('vote', 'Vote function')
    .addParam('id', 'proposal id')
    .addParam('choice', 'your choice in voting ~ True/False')
	.setAction(async ({ choice, id }, { ethers }) => {
        let platform = "0xE793f9229eAc4693E2Bbcb9549f264445d0DEed9"

        const Platform = await ethers.getContractFactory('DAO')
        const daoPlatform = Platform.attach(platform)

        try
        { 
            const contractTx2: ContractTransaction = await daoPlatform.vote(id, choice);
            const contractReceipt: ContractReceipt = await contractTx2.wait();
            const event = contractReceipt.events?.find(event => event.event === 'Voted');
            const voter: Address = event?.args!['voter'];
            const amount: BigNumber = event?.args!['tokenAmount'];
            const pChoice: Boolean = event?.args!['choice'];            
            const pId: Boolean = event?.args!['pId']; 
            if(pChoice){
                console.log(`You used ${amount} tokens to vote FOR in ${pId} proposal!`)
            } else {
                console.log(`You used ${amount} tokens to vote AGAINST in ${pId} proposal!`)
            }       
        }catch(error: any) {
            console.log("ERROR:", error["reason"]);
        }
    })