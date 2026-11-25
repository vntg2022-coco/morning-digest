// Who may read which story. See docs/SPEC.md: Standard readers choose 1 of the
// day's 3 stories and can never open the other two, even later in the archive.

import { PLANS } from './plans.mjs'

// plan: result of currentPlan(); pickedStoryId: the reader's pick for that day (or undefined).
export function storyAccess(plan, storyId, pickedStoryId) {
  if (plan === 'inactive') return 'locked'
  if (PLANS[plan].articlesPerDay >= 3) return 'open'
  if (pickedStoryId === undefined) return 'choose'
  return pickedStoryId === storyId ? 'open' : 'locked'
}
