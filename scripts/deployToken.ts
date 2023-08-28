import {ethers, run, network} from 'hardhat'

const delay = async (time: number) => {
	return new Promise((resolve: any) => {
		setInterval(() => {
			resolve()
		}, time)
	})
}

async function main() {
  const name = "Calleble Token";
  const symbol = "CTK";
  const owner = "0xE793f9229eAc4693E2Bbcb9549f264445d0DEed9"

  const MyToken = await ethers.getContractFactory("CallebleToken");
  const myToken = await MyToken.deploy(name, symbol, owner);

  await myToken.deployed();

  console.log(
    `CallebleToken contract deployed to ${myToken.address}`
  );

  console.log('wait of delay...')
	await delay(15000) // delay 15 secons
	console.log('starting verify token...')
	try {
		await run('verify:verify', {
			address: myToken!.address,
			contract: 'contracts/CallebleToken.sol:CallebleToken',
			constructorArguments: [ name, symbol, owner],
		});
		console.log('verify success')
	} catch (e: any) {
		console.log(e.message)
	}
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
