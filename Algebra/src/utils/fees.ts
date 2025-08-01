import { Pool, PoolPosition, PoolPositionIndex, Position } from '../types/schema'
import { BigDecimal, ethereum } from '@graphprotocol/graph-ts'
import { ZERO_BD, ZERO_BI } from './constants'
import { updatePoolFeeAccruedHourData, updateUserFeeHourData } from './intervalUpdates'

export function distributeFeesToLPs(
  pool: Pool,
  totalFeesUSD: BigDecimal,
  totalFeesToken0: BigDecimal,
  totalFeesToken1: BigDecimal,
  event: ethereum.Event
): void {
  const poolPositionIndex = PoolPositionIndex.load(pool.id)
  if (poolPositionIndex == null) {
    return // No positions in this pool
  }

  const positionIds = poolPositionIndex.positionIds
  const totalLiquidity = pool.liquidity // Use pool's current liquidity

  // Update pool fee accrued hour data
  updatePoolFeeAccruedHourData(
    pool, 
    totalFeesToken0, 
    totalFeesToken1, 
    totalFeesUSD, 
    event
  )

  // Single pass: distribute fees
  for (let i = 0; i < positionIds.length; i++) {
    const position = Position.load(positionIds[i])
    if (position != null && position.liquidity.gt(ZERO_BI)) {
      const liquidityShare = totalLiquidity.gt(ZERO_BI) ? position.liquidity.toBigDecimal().div(totalLiquidity.toBigDecimal()) : ZERO_BD
      const userFeesUSD = liquidityShare.gt(ZERO_BD) ? totalFeesUSD.times(liquidityShare) : ZERO_BD
      const userFeesToken0 = liquidityShare.gt(ZERO_BD) ? totalFeesToken0.times(liquidityShare) : ZERO_BD
      const userFeesToken1 = liquidityShare.gt(ZERO_BD) ? totalFeesToken1.times(liquidityShare) : ZERO_BD
      // Update user fee hour data
      updateUserFeeHourData(
        position.owner,
        pool,
        liquidityShare,
        userFeesUSD,
        userFeesToken0,
        userFeesToken1,
        event
      )
    }
  }
}