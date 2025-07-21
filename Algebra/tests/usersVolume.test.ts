import {
  updateUserVolumeAllTimeData,
  updateUserVolumeDayData,
  updateUserVolumeHourData
} from '../src/utils/intervalUpdates'
import { BigDecimal, BigInt, Bytes, Address, log } from '@graphprotocol/graph-ts'
import { describe, beforeEach, test, assert, clearStore, logStore } from 'matchstick-as/assembly/index'
import { UserVolumeAllTimeData, UserVolumeDayData, UserVolumeHourData } from '../src/types/schema'
import { createSwapMockEvent } from './helpers/createMockEvent'

// Helper to get day and hour ids as used in the code
function getDayId(timestamp: BigInt, user: Bytes): string {
  const day = timestamp.toI32() / 86400
  return user.toHexString() + '-' + day.toString()
}
function getHourId(timestamp: BigInt, user: Bytes): string {
  const hourIndex = timestamp.toI32() / 3600
  const hourStartUnix = hourIndex * 3600
  return user.toHexString() + '-' + hourStartUnix.toString()
}

describe('User Volume Tracking', () => {
  beforeEach(() => {
    clearStore()
  })

  test('should update user volume data on swap', () => {
    // Mock user and event
    const event = createSwapMockEvent(
      1700000000,
      Address.fromString('0xa06e0e48891566a57fa385fad7d81faaf2f90f79'), // sender (router)
      Address.fromString('0x70839ce9406dee5f78b83c234e54439cae44674c'), // recipient
      BigInt.fromI32(1000),
      BigInt.fromI32(-500),
      BigInt.fromI32(123456),
      BigInt.fromI32(10000),
      10,
      0,
      0,
      Address.fromString('0x70839ce9406dee5f78b83c234e54439cae44674c') // origin (EOA)
    )
    const user = event.transaction.from

    const volumeUSD = BigDecimal.fromString('100.0')

    // Call the functions as handleSwap would
    updateUserVolumeAllTimeData(user, volumeUSD, event)
    updateUserVolumeDayData(user, volumeUSD, event)
    updateUserVolumeHourData(user, volumeUSD, event)
    logStore()
    // Check that the entities were created and updated
    const allTime = UserVolumeAllTimeData.load(user.toHexString())
    assert.assertTrue(allTime != null, 'AllTime entity should exist')
    assert.stringEquals(allTime!.volumeUSD.toString(), volumeUSD.toString(), 'AllTime volume should match')

    const dayId = getDayId(BigInt.fromI64(1700000000), user)
    log.info("dayId: {}", [dayId])
    const day = UserVolumeDayData.load(dayId)
    assert.assertTrue(day != null, 'Day entity should exist')
    assert.stringEquals(day!.volumeUSD.toString(), volumeUSD.toString(), 'Day volume should match')

    const hourId = getHourId(BigInt.fromI64(1700000000), user)
    const hour = UserVolumeHourData.load(hourId)
    assert.assertTrue(hour != null, 'Hour entity should exist')
    assert.stringEquals(hour!.volumeUSD.toString(), volumeUSD.toString(), 'Hour volume should match')
  })

  test('should be additive for multiple swaps in the same day/hour', () => {
    const event = createSwapMockEvent(
      1700000000,
      Address.fromString('0xa06e0e48891566a57fa385fad7d81faaf2f90f79'),
      Address.fromString('0x70839ce9406dee5f78b83c234e54439cae44674c'),
      BigInt.fromI32(1000),
      BigInt.fromI32(-500),
      BigInt.fromI32(123456),
      BigInt.fromI32(10000),
      10,
      0,
      0,
      Address.fromString('0x70839ce9406dee5f78b83c234e54439cae44674c')
    )
    const user = event.transaction.from
    const volumeUSD = BigDecimal.fromString('100.0')

    // Call the update functions twice
    updateUserVolumeAllTimeData(user, volumeUSD, event)
    updateUserVolumeDayData(user, volumeUSD, event)
    updateUserVolumeHourData(user, volumeUSD, event)
    updateUserVolumeAllTimeData(user, volumeUSD, event)
    updateUserVolumeDayData(user, volumeUSD, event)
    updateUserVolumeHourData(user, volumeUSD, event)
    logStore()

    // Check that the entities were updated additively
    const allTime = UserVolumeAllTimeData.load(user.toHexString())
    assert.assertTrue(allTime != null, 'AllTime entity should exist')
    assert.stringEquals(allTime!.volumeUSD.toString(), '200', 'AllTime volume should be additive')

    const dayId = getDayId(BigInt.fromI64(1700000000), user)
    const day = UserVolumeDayData.load(dayId)
    assert.assertTrue(day != null, 'Day entity should exist')
    assert.stringEquals(day!.volumeUSD.toString(), '200', 'Day volume should be additive')

    const hourId = getHourId(BigInt.fromI64(1700000000), user)
    const hour = UserVolumeHourData.load(hourId)
    assert.assertTrue(hour != null, 'Hour entity should exist')
    assert.stringEquals(hour!.volumeUSD.toString(), '200', 'Hour volume should be additive')
  })

  test('should create a new UserVolumeHourData for a swap in a different hour', () => {
    const user = Address.fromString('0x70839ce9406dee5f78b83c234e54439cae44674c')
    const volumeUSD = BigDecimal.fromString('100.0')

    // First event at hour 1700000000
    const event1 = createSwapMockEvent(
      1700000000,
      Address.fromString('0xa06e0e48891566a57fa385fad7d81faaf2f90f79'),
      user,
      BigInt.fromI32(1000),
      BigInt.fromI32(-500),
      BigInt.fromI32(123456),
      BigInt.fromI32(10000),
      10,
      0,
      0,
      user
    )
    updateUserVolumeHourData(user, volumeUSD, event1)

    // Second event one hour later
    const event2 = createSwapMockEvent(
      1700000000 + 3600,
      Address.fromString('0xa06e0e48891566a57fa385fad7d81faaf2f90f79'),
      user,
      BigInt.fromI32(1000),
      BigInt.fromI32(-500),
      BigInt.fromI32(123456),
      BigInt.fromI32(10000),
      10,
      0,
      0,
      user
    )
    updateUserVolumeHourData(user, volumeUSD, event2)
    logStore()

    // Assert both hour entities exist and have correct volume
    const hourId1 = getHourId(BigInt.fromI64(1700000000), user)
    const hour1 = UserVolumeHourData.load(hourId1)
    assert.assertTrue(hour1 != null, 'Hour 1 entity should exist')
    assert.stringEquals(hour1!.volumeUSD.toString(), '100', 'Hour 1 volume should match')

    const hourId2 = getHourId(BigInt.fromI64(1700000000 + 3600), user)
    const hour2 = UserVolumeHourData.load(hourId2)
    assert.assertTrue(hour2 != null, 'Hour 2 entity should exist')
    assert.stringEquals(hour2!.volumeUSD.toString(), '100', 'Hour 2 volume should match')
  })

  test('should create a new UserVolumeDayData for a swap on a different day', () => {
    const user = Address.fromString('0x70839ce9406dee5f78b83c234e54439cae44674c')
    const volumeUSD = BigDecimal.fromString('100.0')

    // First event at day 1700000000
    const event1 = createSwapMockEvent(
      1700000000,
      Address.fromString('0xa06e0e48891566a57fa385fad7d81faaf2f90f79'),
      user,
      BigInt.fromI32(1000),
      BigInt.fromI32(-500),
      BigInt.fromI32(123456),
      BigInt.fromI32(10000),
      10,
      0,
      0,
      user
    )
    updateUserVolumeDayData(user, volumeUSD, event1)

    // Second event one day later
    const event2 = createSwapMockEvent(
      1700000000 + 86400,
      Address.fromString('0xa06e0e48891566a57fa385fad7d81faaf2f90f79'),
      user,
      BigInt.fromI32(1000),
      BigInt.fromI32(-500),
      BigInt.fromI32(123456),
      BigInt.fromI32(10000),
      10,
      0,
      0,
      user
    )
    updateUserVolumeDayData(user, volumeUSD, event2)
    logStore()

    // Assert both day entities exist and have correct volume
    const dayId1 = getDayId(BigInt.fromI64(1700000000), user)
    const day1 = UserVolumeDayData.load(dayId1)
    assert.assertTrue(day1 != null, 'Day 1 entity should exist')
    assert.stringEquals(day1!.volumeUSD.toString(), '100', 'Day 1 volume should match')

    const dayId2 = getDayId(BigInt.fromI64(1700000000 + 86400), user)
    const day2 = UserVolumeDayData.load(dayId2)
    assert.assertTrue(day2 != null, 'Day 2 entity should exist')
    assert.stringEquals(day2!.volumeUSD.toString(), '100', 'Day 2 volume should match')
  })
})
