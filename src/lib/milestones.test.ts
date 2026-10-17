import { describe, expect, it } from 'vitest'
import { getMilestoneState, milestonesUpTo, nextMilestone, pendingCelebration } from './milestones'

const H = 3_600_000
const D = 24 * H

describe('milestones', () => {
  it('starts with 12h and moves on to 24h', () => {
    expect(nextMilestone(0).id).toBe('12h')
    expect(nextMilestone(13 * H).id).toBe('24h')
  })

  it('reports progress between the previous and the next milestone', () => {
    expect(getMilestoneState(18 * H).progress).toBeCloseTo(0.5)
    expect(getMilestoneState(18 * H).reached.map((m) => m.id)).toEqual(['12h'])
  })

  it('keeps generating milestones with no end', () => {
    const ids = milestonesUpTo(1000 * D).map((m) => m.id)
    expect(ids).toContain('2y')
    expect(ids).toContain('day-100')
    expect(ids).toContain('day-1000')
    expect(ids).not.toContain('year-3')
    expect(nextMilestone(1000 * D).id).toBe('year-3')
    expect(nextMilestone(5000 * D).ms).toBeGreaterThan(5000 * D)
  })

  it('celebrates only the highest pending milestone', () => {
    expect(pendingCelebration(8 * D, ['12h'])?.id).toBe('1w')
    expect(pendingCelebration(8 * D, ['1w'])).toBeNull()
    expect(pendingCelebration(H, [])).toBeNull()
  })
})
