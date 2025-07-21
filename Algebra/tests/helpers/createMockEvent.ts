import { newMockEvent } from 'matchstick-as/assembly/index'
import { ethereum, BigInt, Address } from '@graphprotocol/graph-ts'

/**
 * Creates a mock Swap event for testing.
 * @param timestamp Block timestamp
 * @param sender Router address (event.params.sender)
 * @param recipient Recipient address (event.params.recipient)
 * @param amount0 Amount0 (event.params.amount0)
 * @param amount1 Amount1 (event.params.amount1)
 * @param price Price (event.params.price)
 * @param liquidity Liquidity (event.params.liquidity)
 * @param tick Tick (event.params.tick)
 * @param overrideFee Override fee (event.params.overrideFee)
 * @param pluginFee Plugin fee (event.params.pluginFee)
 * @param origin EOA address (event.transaction.from)
 */
export function createSwapMockEvent(
  timestamp: number,
  sender: Address = Address.fromString('0xa06e0e48891566a57fa385fad7d81faaf2f90f79'),
  recipient: Address = Address.fromString('0x70839ce9406dee5f78b83c234e54439cae44674c'),
  amount0: BigInt = BigInt.fromI32(1000),
  amount1: BigInt = BigInt.fromI32(-500),
  price: BigInt = BigInt.fromI32(123456),
  liquidity: BigInt = BigInt.fromI32(10000),
  tick: i32 = 10,
  overrideFee: i32 = 0,
  pluginFee: i32 = 0,
  origin: Address = Address.fromString('0x70839ce9406dee5f78b83c234e54439cae44674c')
): ethereum.Event {
  const event = newMockEvent()
  event.block.timestamp = BigInt.fromI64(timestamp as u64)
  event.parameters = []
  event.parameters.push(new ethereum.EventParam('sender', ethereum.Value.fromAddress(sender)))
  event.parameters.push(new ethereum.EventParam('recipient', ethereum.Value.fromAddress(recipient)))
  event.parameters.push(new ethereum.EventParam('amount0', ethereum.Value.fromSignedBigInt(amount0)))
  event.parameters.push(new ethereum.EventParam('amount1', ethereum.Value.fromSignedBigInt(amount1)))
  event.parameters.push(new ethereum.EventParam('price', ethereum.Value.fromUnsignedBigInt(price)))
  event.parameters.push(new ethereum.EventParam('liquidity', ethereum.Value.fromUnsignedBigInt(liquidity)))
  event.parameters.push(new ethereum.EventParam('tick', ethereum.Value.fromI32(tick)))
  event.parameters.push(new ethereum.EventParam('overrideFee', ethereum.Value.fromI32(overrideFee)))
  event.parameters.push(new ethereum.EventParam('pluginFee', ethereum.Value.fromI32(pluginFee)))
  event.transaction.from = origin
  return event as ethereum.Event
}