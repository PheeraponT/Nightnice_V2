# Testing Guide: Review & Rating System

## Prerequisites

### 1. Start Backend
```bash
cd backend/src/Nightnice.Api
dotnet run
```
Backend should be running on `http://localhost:5005`

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend should be running on `http://localhost:3000`

---

## Test Scenarios

### ✅ Test 1: Anonymous User (No Login)
**Objective**: Verify anonymous users can view reviews but not submit

1. Open any store page (e.g., `http://localhost:3000/store/[any-store-slug]`)
2. Scroll to Reviews section
3. **Expected**:
   - ✓ Review stats displayed (if reviews exist)
   - ✓ "Sign in with Google" button shown instead of review form
   - ✓ Can view existing reviews
   - ✓ Cannot vote "helpful" (button disabled with tooltip)
   - ✓ Cannot report reviews

---

### ✅ Test 2: Google Sign-In
**Objective**: Verify Firebase Google authentication works

1. Click "เข้าสู่ระบบด้วย Google" button
2. Complete Google sign-in flow
3. **Expected**:
   - ✓ Google OAuth popup appears
   - ✓ After successful login, popup closes
   - ✓ Review form appears (no longer showing sign-in button)
   - ✓ User's photo/name may appear in navbar (if implemented)

---

### ✅ Test 3: Submit First Review
**Objective**: Create a new review with validation

1. After signing in, scroll to review form
2. Try submitting without selecting stars
   - **Expected**: ✓ Error message "กรุณาเลือกคะแนน"
3. Select 5 stars
4. Try submitting with only 5 characters in content
   - **Expected**: ✓ Error message "รีวิวต้องมีอย่างน้อย 10 ตัวอักษร"
5. Write a valid review:
   - **Stars**: 5
   - **Title** (optional): "ร้านดีมาก!"
   - **Content**: "บรรยากาศดี เพลงเพราะ ราคาสมเหตุสมผล"
6. Click "ส่งรีวิว"
7. **Expected**:
   - ✓ Loading state shows ("กำลังส่งรีวิว...")
   - ✓ Review appears in list immediately
   - ✓ Form resets (stars back to 0, content cleared)
   - ✓ Review stats updates (average rating, total reviews)
   - ✓ Rating breakdown shows 1 review in "5 ดาว"

---

### ✅ Test 4: View Review
**Objective**: Verify review display

1. Check the newly created review card
2. **Expected**:
   - ✓ User's Google photo/name displayed
   - ✓ 5 stars shown with neon glow effect
   - ✓ Title displayed (if provided)
   - ✓ Content displayed
   - ✓ "เป็นประโยชน์ (0)" button shown
   - ✓ Three-dot menu shows "แก้ไขรีวิว" and "ลบรีวิว" (owner)
   - ✓ "เมื่อสักครู่" or time ago displayed

---

### ✅ Test 5: Vote "Helpful"
**Objective**: Test helpful vote with optimistic update

1. On your own review, click "เป็นประโยชน์"
   - **Expected**: ✓ Button becomes active (filled), count shows "(1)"
2. Click again to unvote
   - **Expected**: ✓ Button becomes inactive (outline), count shows "(0)"
3. Click again to vote
   - **Expected**: ✓ Immediate UI update (optimistic)

---

### ✅ Test 6: Edit Review
**Objective**: Update existing review

1. Click three-dot menu on your review
2. Select "แก้ไขรีวิว"
3. **Current Implementation**: Console logs "Edit review: [id]"
4. **TODO**: Implement edit modal
   - Should populate form with existing data
   - Allow changing stars, title, content
   - Show "Edited" badge after update

---

### ✅ Test 7: Delete Review
**Objective**: Remove your own review

1. Click three-dot menu on your review
2. Select "ลบรีวิว"
3. Confirm deletion in browser alert
4. **Expected**:
   - ✓ Review disappears from list
   - ✓ Review stats updates (total reviews decreases)
   - ✓ Rating breakdown updates

---

### ✅ Test 8: Report Review (Different User)
**Objective**: Report inappropriate review

**Setup**: Need a second user or existing review from another user

1. Find a review NOT created by you
2. Click three-dot menu
3. Select "รายงานรีวิว"
4. **Expected**:
   - ✓ Modal opens with report form
   - ✓ Dropdown has options: สแปม, เนื้อหาไม่เหมาะสม, รีวิวปลอม, ไม่เกี่ยวข้อง, อื่นๆ
   - ✓ Optional description textarea
5. Select reason and submit
6. **Expected**:
   - ✓ Success message "รายงานรีวิวเรียบร้อยแล้ว"
   - ✓ Modal closes
   - ✓ Review still visible (not auto-hidden)

---

### ✅ Test 9: Pagination
**Objective**: Navigate through multiple reviews

**Setup**: Need at least 11 reviews (create with different accounts or via API)

1. Reviews should show 10 per page
2. Pagination controls appear at bottom
3. Click page 2
4. **Expected**:
   - ✓ Next 10 reviews load
   - ✓ Page 2 button highlighted
   - ✓ "Previous" button enabled

---

### ✅ Test 10: Sorting
**Objective**: Test different sort orders

**Setup**: Need multiple reviews with different ratings and helpful counts

1. Default sort is "ล่าสุด" (recent)
2. Change to "เป็นประโยชน์มากที่สุด"
   - **Expected**: ✓ Reviews reorder by helpful count (descending)
3. Change to "คะแนนสูงสุด"
   - **Expected**: ✓ 5-star reviews appear first
4. Change to "คะแนนต่ำสุด"
   - **Expected**: ✓ 1-star reviews appear first

---

### ✅ Test 11: Review Stats Breakdown
**Objective**: Verify aggregated statistics

**Setup**: Create reviews with different ratings (1-5 stars)

1. Check review stats section
2. **Expected**:
   - ✓ Large average rating number with 1 decimal (e.g., "4.5")
   - ✓ Total review count
   - ✓ Star rating bars show correct counts
   - ✓ Visual bar widths match percentages
   - ✓ Neon glow on filled bars
   - ✓ Summary shows:
     - "รีวิวเชิงบวก" (4-5 stars)
     - "รีวิวปานกลาง" (3 stars)
     - "รีวิวเชิงลบ" (1-2 stars)

---

### ✅ Test 12: Duplicate Review Prevention
**Objective**: User cannot submit multiple reviews to same store

1. Submit a review to store A
2. Try to submit another review to same store A
3. **Expected**:
   - ✓ Backend returns error: "You have already reviewed this store"
   - ✓ Error message displayed to user

---

### ✅ Test 13: Character Limits
**Objective**: Validate input constraints

1. **Title**: Try entering 201 characters
   - **Expected**: ✓ Input limited to 200, counter shows "200/200"
2. **Content**: Try entering 2001 characters
   - **Expected**: ✓ Input limited to 2000, counter shows "2000/2000"
3. **Content**: Enter only 5 characters and submit
   - **Expected**: ✓ Error message "รีวิวต้องมีอย่างน้อย 10 ตัวอักษร"

---

### ✅ Test 14: Empty State
**Objective**: Verify empty state when no reviews exist

**Setup**: Test on a store with zero reviews

1. **Expected**:
   - ✓ "ยังไม่มีรีวิว" message
   - ✓ "เป็นคนแรกที่แชร์ประสบการณ์ของคุณ" subtitle
   - ✓ Review form still available (if logged in)

---

### ✅ Test 15: Mobile Responsiveness
**Objective**: Test UI on mobile viewport

1. Open DevTools → Toggle device toolbar (Cmd/Ctrl + Shift + M)
2. Set to iPhone 12 Pro (390x844)
3. **Expected**:
   - ✓ Review form fits width
   - ✓ Star rating clickable with proper touch targets (44x44px)
   - ✓ Review cards stack properly
   - ✓ Buttons readable and accessible
   - ✓ Modal covers full screen on mobile

---

### ✅ Test 16: Sign Out
**Objective**: Verify sign-out behavior

1. Sign out (if sign-out button implemented)
2. **Expected**:
   - ✓ Review form replaced with "Sign in with Google" button
   - ✓ "Helpful" buttons disabled
   - ✓ Edit/Delete options no longer visible
   - ✓ Can still view all reviews

---

## API Testing (Optional)

### Test Backend Directly with curl

**1. Get Review Stats**
```bash
curl http://localhost:5005/api/reviews/store/{storeId}/stats
```

**2. Get Reviews**
```bash
curl "http://localhost:5005/api/reviews/store/{storeId}?page=1&pageSize=10&sortBy=recent"
```

**3. Create Review (requires Firebase token)**
```bash
curl -X POST http://localhost:5005/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {FIREBASE_ID_TOKEN}" \
  -d '{
    "storeId": "{storeId}",
    "rating": 5,
    "title": "Test Review",
    "content": "This is a test review with at least 10 characters."
  }'
```

---

## Common Issues & Solutions

### Issue 1: "Firebase not initialized"
**Solution**: Check `.env.local` has all Firebase variables and restart dev server

### Issue 2: "CORS error"
**Solution**: Verify backend is running on port 5005 and CORS is enabled

### Issue 3: "401 Unauthorized"
**Solution**: Firebase token expired, sign out and sign in again

### Issue 4: Review not appearing immediately
**Solution**: Check browser console for errors, verify query invalidation is working

### Issue 5: "User is banned" error
**Solution**: User account flagged in database, check `Users` table `IsBanned` field

---

## Success Criteria

All tests pass if:
- ✅ Authentication flow works smoothly
- ✅ Reviews can be created, read, updated, deleted
- ✅ Helpful votes work with optimistic updates
- ✅ Pagination and sorting function correctly
- ✅ Stats update in real-time
- ✅ Validation prevents invalid submissions
- ✅ UI is responsive and accessible
- ✅ No console errors during normal operation

---

## Next Steps

After successful testing:
1. Implement edit review modal (currently just console.log)
2. Add toast notifications for success/error states
3. Implement admin panel for review moderation
4. Add review images support (future enhancement)
5. Implement review replies (future enhancement)
