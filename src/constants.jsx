
const CONTRACT_ADDRESS = "0x6f9cE9ADccdaaa9254F6DEf33e8E2A50798143Fa";
const NETWORK_VERSION = "4";

const transformCharacterData = (characterData) => ({
  name: characterData.name,
  imageUri: characterData.imageUri,
  hp: characterData.hp.toNumber(),
  maxHp: characterData.maxHp.toNumber(),
  attackDamage:characterData.attackDamage.toNumber()
})

export {
  CONTRACT_ADDRESS,
  NETWORK_VERSION,
  transformCharacterData,
};