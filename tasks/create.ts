import { task } from 'hardhat/config'
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task('create', 'Create a new proposal')
    .addParam('data', 'tranaction calldata')
    .addParam('address', 'callable contract address')
	.setAction(async ({ data, address }, { ethers }) => {
        let platform = "0xE793f9229eAc4693E2Bbcb9549f264445d0DEed9"

        const Platform = await ethers.getContractFactory('DAO')
        const daoPlatform = Platform.attach(platform)

        try
        { 
            const contractTx2: ContractTransaction = await daoPlatform.addProposal(data, address);
            const contractReceipt: ContractReceipt = await contractTx2.wait();
            const event = contractReceipt.events?.find(event => event.event === 'AddProposal');
            const ePid: BigNumber = event?.args!['pId'];
            const eContract: Address = event?.args!['pCallAddres'];
            const eCalldata: String = event?.args!['pCallData'];            
            console.log(`Proposal with ${ePid} id was successful created with calldata: ${eCalldata} !`)
        }catch(error: any) {
            console.log("ERROR:", error["reason"]);
        }
    })