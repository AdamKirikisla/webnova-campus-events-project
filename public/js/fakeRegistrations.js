// Shared fake registration data for the "View Registrations" admin page.
// Field names match the "8.3 Registrations Table" schema from the project requirements,
// plus an extra event_name field (not in the spec) so the table doesn't need to look it
// up from fakeEvents on every render. Note: this duplicates data that already lives in
// fakeEvents, so if an event gets renamed both places need updating — in Deliverable 2,
// once this comes from a real database, a JOIN on event_id removes that duplication.
//   registration_id  -> Unique registration ID
//   user_id           -> Student ID
//   event_id          -> Event ID
//   event_name         -> Event title (denormalized for convenience)
//   registration_date -> Date of registration
//   status             -> registered, cancelled, attended, missed
//   attended           -> 'yes', 'no', or 'not yet' (not determined until after the event)

const fakeRegistrations = [
  // Event 1: Fall Career Fair (Sep 12, 2026 - upcoming)
  {
    registration_id: 1,
    user_id: 'S1001',
    event_id: 1,
    event_name: 'Fall Career Fair',
    registration_date: '2026-08-20',
    status: 'registered',
    attended: 'Not yet',
  },
  {
    registration_id: 2,
    user_id: 'S1002',
    event_id: 1,
    event_name: 'Fall Career Fair',
    registration_date: '2026-08-21',
    status: 'registered',
    attended: 'Not yet',
  },
  {
    registration_id: 3,
    user_id: 'S1003',
    event_id: 1,
    event_name: 'Fall Career Fair',
    registration_date: '2026-08-19',
    status: 'cancelled',
    attended: 'Not yet',
  },

  // Event 2: Intro to Machine Learning Workshop (Aug 3, 2026 - past)
  {
    registration_id: 4,
    user_id: 'S1004',
    event_id: 2,
    event_name: 'Intro to Machine Learning Workshop',
    registration_date: '2026-07-25',
    status: 'attended',
    attended: 'Attended',
  },
  {
    registration_id: 5,
    user_id: 'S1005',
    event_id: 2,
    event_name: 'Intro to Machine Learning Workshop',
    registration_date: '2026-07-26',
    status: 'missed',
    attended: 'Missed',
  },
  {
    registration_id: 6,
    user_id: 'S1006',
    event_id: 2,
    event_name: 'Intro to Machine Learning Workshop',
    registration_date: '2026-07-27',
    status: 'attended',
    attended: 'Attended',
  },

  // Event 3: Chess Club Weekly Meetup (Jul 22, 2026 - past)
  {
    registration_id: 7,
    user_id: 'S1007',
    event_id: 3,
    event_name: 'Chess Club Weekly Meetup',
    registration_date: '2026-07-15',
    status: 'attended',
    attended: 'Attended',
  },
  {
    registration_id: 8,
    user_id: 'S1008',
    event_id: 3,
    event_name: 'Chess Club Weekly Meetup',
    registration_date: '2026-07-16',
    status: 'registered',
    attended: 'Not yet',
  },
  {
    registration_id: 9,
    user_id: 'S1009',
    event_id: 3,
    event_name: 'Chess Club Weekly Meetup',
    registration_date: '2026-07-17',
    status: 'missed',
    attended: 'Missed',
  },

  // Event 4: Varsity Soccer vs Concordia Stingers (Jul 25, 2026 - past)
  {
    registration_id: 10,
    user_id: 'S1010',
    event_id: 4,
    event_name: 'Varsity Soccer vs Concordia Stingers',
    registration_date: '2026-07-18',
    status: 'attended',
    attended: 'Attended',
  },
  {
    registration_id: 11,
    user_id: 'S1011',
    event_id: 4,
    event_name: 'Varsity Soccer vs Concordia Stingers',
    registration_date: '2026-07-19',
    status: 'missed',
    attended: 'Missed',
  },

  // Event 5: Guest Lecture: AI Ethics (Aug 10, 2026 - upcoming)
  {
    registration_id: 12,
    user_id: 'S1012',
    event_id: 5,
    event_name: 'Guest Lecture: AI Ethics',
    registration_date: '2026-08-01',
    status: 'registered',
    attended: 'Not yet',
  },
  {
    registration_id: 13,
    user_id: 'S1013',
    event_id: 5,
    event_name: 'Guest Lecture: AI Ethics',
    registration_date: '2026-08-02',
    status: 'registered',
    attended: 'Not yet',
  },
  {
    registration_id: 14,
    user_id: 'S1014',
    event_id: 5,
    event_name: 'Guest Lecture: AI Ethics',
    registration_date: '2026-08-03',
    status: 'cancelled',
    attended: 'Not yet',
  },

  // Event 6: Fall Frosh Networking Night (event was cancelled)
  {
    registration_id: 15,
    user_id: 'S1015',
    event_id: 6,
    event_name: 'Fall Frosh Networking Night',
    registration_date: '2026-06-15',
    status: 'cancelled',
    attended: 'Not yet',
  },
  {
    registration_id: 16,
    user_id: 'S1016',
    event_id: 6,
    event_name: 'Fall Frosh Networking Night',
    registration_date: '2026-06-16',
    status: 'cancelled',
    attended: 'Not yet',
  },

  // Event 7: Volunteer Day: Campus Cleanup (completed)
  {
    registration_id: 17,
    user_id: 'S1017',
    event_id: 7,
    event_name: 'Volunteer Day: Campus Cleanup',
    registration_date: '2026-07-10',
    status: 'attended',
    attended: 'Attended',
  },
  {
    registration_id: 18,
    user_id: 'S1018',
    event_id: 7,
    event_name: 'Volunteer Day: Campus Cleanup',
    registration_date: '2026-07-11',
    status: 'missed',
    attended: 'Missed',
  },
];
