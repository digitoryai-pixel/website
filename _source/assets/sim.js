/* Digitory simulator — venue- and page-specific scenarios built around the most important AI agents. Sample data only. */
(function () {
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function wait(ms) { return new Promise(function (r) { setTimeout(r, RM ? Math.min(ms, 60) : ms); }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function rs(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }

  var ICON = {
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>', chef: '<path d="M6 14a4 4 0 01-1-7.9A5 5 0 0112 3a5 5 0 017 3.1A4 4 0 0118 14"/><path d="M6 14h12v6H6z"/>',
    box: '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/>', chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/>',
    truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>', building: '<path d="M4 21V5l8-2v18M12 7l8 3v11M2 21h20"/>',
    wallet: '<path d="M3 7h16a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 7l12-4v4"/>', phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    bike: '<circle cx="5.5" cy="17" r="3.5"/><circle cx="18.5" cy="17" r="3.5"/><path d="M5.5 17l4-8h5l4 8"/>', spark: '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/>',
    bank: '<path d="M3 10l9-6 9 6M5 10v8M10 10v8M14 10v8M19 10v8M3 21h18"/>', book: '<path d="M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4z"/>', printer: '<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z"/>'
  };
  function icon(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON[n] || ICON.spark) + '</svg>'; }

  /* ---------------- venue profiles ---------------- */
  var V = {
    bars: { label: 'Brewery or bar', venue: 'The Hop House', outlet: 'Indiranagar', outlets: 2, dish: 'Chicken Wings', price: 420, ing: 'Chicken', vendor: 'Metro', staff: 'Ravi', station: 'Bar 2', setup: 'Excise categories set for 46 spirit brands', items: 164, sales: '₹6.4L', top: 'Hefeweizen (pint)' },
    cafes: { label: 'Café or QSR', venue: 'Bean Street', outlet: 'Koramangala', outlets: 3, dish: 'Cold Coffee', price: 220, ing: 'Milk', vendor: 'Nandini Dairy', staff: 'Sameer', station: 'Coffee bar', setup: 'QR ordering live on 22 tables', items: 96, sales: '₹2.1L', top: 'Cold Coffee' },
    fine: { label: 'Fine dining', venue: 'Saffron Table', outlet: 'Lavelle Road', outlets: 1, dish: 'Lamb Shank', price: 1450, ing: 'Lamb', vendor: 'Meat Masters', staff: 'Arjun', station: 'Tandoor', setup: 'Table plan and course firing set up', items: 74, sales: '₹3.6L', top: 'Lamb Shank' },
    cloud: { label: 'Cloud kitchen', venue: 'Biryani Bros + 3 brands', outlet: 'Bellandur kitchen', outlets: 1, dish: 'Chicken Biryani', price: 329, ing: 'Basmati rice', vendor: 'Sai Traders', staff: 'Imran', station: 'Grill', setup: '4 brands linked to Swiggy and Zomato', items: 212, sales: '₹1.9L', top: 'Chicken Biryani' },
    chains: { label: 'Restaurant chain', venue: 'Spice Route (8 outlets)', outlet: 'Whitefield', outlets: 8, dish: 'Paneer Butter Masala', price: 340, ing: 'Paneer', vendor: 'Fresh Farms', staff: 'Kiran', station: 'Tandoor', setup: '8 outlets and a central kitchen connected', items: 138, sales: '₹14.2L', top: 'Paneer Butter Masala' },
    events: { label: 'Club or events', venue: 'Neon Yard', outlet: 'Main venue', outlets: 1, dish: 'Pint of lager', price: 380, ing: 'Lager kegs', vendor: 'United Breweries', staff: 'Neil', station: 'Bar 2', setup: 'Wallets, ticketing and entry scanners set up', items: 88, sales: '₹18.4L', top: 'Pint of lager' }
  };

  /* ---------------- scenarios: one AI agent story each ---------------- */
  var S = {
    onboard: function (p) { return { tab: 'Onboarding', kicker: 'Day 1', title: 'Live in days, not weeks', agents: ['AI onboarding', 'Menu health', 'Digitory onboarding team'],
      text: 'Send your menu in any format. The onboarding agent sets up items, taxes, stations and recipes; our team checks it and trains your staff.', outcome: 'From a menu file to your first bill in days, checked by people.',
      steps: [{ t: 'msg', who: 'you', name: 'You', text: 'Here’s our menu.', file: 'menu.pdf' },
        { t: 'flow', title: 'What the onboarding agent does', nodes: [['receipt', 'Read menu'], ['box', 'Recipes'], ['chef', 'Stations'], ['chart', 'Taxes']] },
        { t: 'prog', label: 'Items set up', to: p.items },
        { t: 'card', title: 'Ready for you to check', rows: [['Items', p.items], ['Taxes', 'GST 5% and 18% mapped'], ['Venue setup', p.setup]] },
        { t: 'ask', who: 'Menu health', text: '3 items have no GST and 1 item has two prices. Fix all?', btn: 'Fix all', done: '4 fixes applied · undo available' },
        { t: 'msg', who: 'team', name: 'Digitory onboarding team', text: 'Recipes reviewed, printers and staff logins set. Training on Thursday, live on Friday.' }] }; },

    pegvar: function (p) { return { tab: 'Peg variance', kicker: 'Next morning', title: 'Every peg accounted for', agents: ['Variance and theft', 'Bar stock'],
      text: 'Bottle levels are compared with what was billed, bar by bar and shift by shift. Gaps are found the next morning, not at the monthly count.', outcome: 'Leaks caught in a day. Bar variance stays in single digits.',
      steps: [{ t: 'sys', text: 'Saturday close · whisky' },
        { t: 'bottles', title: 'Billed vs poured · last night', items: [['Bar 1', 96, 97], ['Bar 2', 82, 96], ['Bar 3', 74, 75]] },
        { t: 'msg', who: 'ai', name: 'Variance and theft', text: 'Bar 2 poured 14 pegs more than it billed (₹4,200). Bars 1 and 3 are within 1%.' },
        { t: 'ask', who: 'Variance and theft', text: 'Flag Bar 2 to the bar manager and add a spot count tonight?', btn: 'Flag it', done: 'Bar manager notified · spot count on tonight’s checklist' },
        { t: 'gauge', label: 'Bar variance this month', from: 4.8, to: 1.6, unit: '%', better: true }] }; },

    shiftwatch: function (p) { return { tab: 'Shift watch', kicker: 'During service', title: 'Unusual voids, caught on the night', agents: ['Shift watch'],
      text: 'Voids, discounts, no-charge bills and reprints are watched live and compared with each person’s normal pattern.', outcome: 'Leakage stopped while the bills and the staff are still there.',
      steps: [{ t: 'sys', text: 'Friday · 11:20 PM · ' + p.outlet },
        { t: 'chart', title: 'Voids per staff member tonight', labels: ['Asha', 'Dev', p.staff, 'Meera', 'Joel'], values: [1, 2, 7, 1, 0], hi: [2] },
        { t: 'msg', who: 'ai', name: 'Shift watch', text: p.staff + ' has voided 7 bills worth ₹5,900, 4× the usual. 5 were after 11 PM on Terminal 2.' },
        { t: 'ask', who: 'Shift watch', text: 'Send the bills to the manager on duty?', btn: 'Send', done: 'Sent with bills attached · logged in the audit trail' }] }; },

    happyhour: function (p) { return { tab: 'Fill quiet nights', kicker: 'Planning the week', title: 'Turn a quiet Tuesday into a full one', agents: ['Quiet-day campaign', 'Guests'],
      text: 'The agent finds your slowest slots, picks the regulars most likely to come in, and drafts the offer. You approve, then see the result.', outcome: 'Quiet slots filled without discounting your busy nights.',
      steps: [{ t: 'chart', title: 'Covers by day · last 4 weeks', labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [62, 48, 70, 95, 160, 182, 120], hi: [1] },
        { t: 'msg', who: 'ai', name: 'Quiet-day campaign', text: 'Tuesday 6 to 8 PM is 40% below average. 540 regulars come on weekdays.' },
        { t: 'card', title: 'Offer drafted', rows: [['Offer', 'Happy hour extended to 9 PM'], ['Sent to', '540 weekday regulars on WhatsApp'], ['Expected', 'about 70 extra covers']] },
        { t: 'ask', who: 'Quiet-day campaign', text: 'Send it?', btn: 'Send offer', done: 'Sent · Tuesday covers up 31% the next week' }] }; },

    excise: function (p) { return { tab: 'Excise', kicker: 'Compliance', title: 'Excise registers that keep themselves', agents: ['Compliance watch', 'Bar stock'],
      text: 'Every sale and receipt updates the excise registers. The agent flags gaps before an inspection, not during one.', outcome: 'Registers always ready; no weekend of paperwork.',
      steps: [{ t: 'flow', title: 'How the register updates', nodes: [['truck', 'Receipt'], ['receipt', 'Sales'], ['box', 'Bottle stock'], ['book', 'Register']] },
        { t: 'card', title: 'Excise registers · this week', rows: [['Spirits', 'Up to date', 'good'], ['Beer', 'Up to date', 'good'], ['Bar 2 transfer', '2 bottles not recorded', 'bad']] },
        { t: 'ask', who: 'Compliance watch', text: 'Record the 2 transferred bottles from the store to Bar 2?', btn: 'Record', done: 'Register updated · ready for inspection' }] }; },

    kitchenpace: function (p) { return { tab: 'Rush hour', kicker: 'Lunch rush', title: 'Every order to the right station, on time', agents: ['POS and KDS', 'Kitchen pace'],
      text: 'QR, counter and delivery orders print or show on the right station instantly. Kitchen pace watches prep times and warns before guests notice.', outcome: 'Faster service at peak, without shouting across the kitchen.',
      steps: [{ t: 'flow', title: 'Orders flowing in', nodes: [['phone', 'QR'], ['receipt', 'Counter'], ['bike', 'Swiggy'], ['chef', p.station]] },
        { t: 'ticket', title: 'KOT · ' + p.station, lines: ['QR · Table 4', '2 × ' + p.dish, '1 × Croissant', 'Note: less ice'] },
        { t: 'gauge', label: p.station + ' average prep time', from: 6, to: 14, unit: ' min', better: false },
        { t: 'msg', who: 'ai', name: 'Kitchen pace', text: p.station + ' is at 14 minutes against a usual 6. 9 orders waiting.' },
        { t: 'ask', who: 'Kitchen pace', text: 'Pause QR orders for ' + p.station + ' items for 10 minutes and alert the manager?', btn: 'Do it', done: 'Paused · wait time back to 7 minutes' }] }; },

    winback: function (p) { return { tab: 'Win-back', kicker: 'Guests', title: 'Bring regulars back before they’re gone', agents: ['Win-back', 'Loyalty'],
      text: 'The agent spots regulars who stopped coming and drafts a personal WhatsApp offer. You approve the list and the message.', outcome: 'Lapsed guests return; offers go only to the right people.',
      steps: [{ t: 'chart', title: 'Regulars by last visit', labels: ['<7 days', '7–14', '14–30', '30–60', '60+'], values: [820, 610, 430, 312, 190], hi: [3] },
        { t: 'msg', who: 'ai', name: 'Win-back', text: '312 regulars haven’t visited in 30 to 60 days. Most used to come on weekday mornings.' },
        { t: 'card', title: 'Offer drafted', rows: [['Message', '“We miss you! Your next ' + p.dish + ' is on us.”'], ['Guests', '312'], ['Expected', 'about 40 visits']] },
        { t: 'ask', who: 'Win-back', text: 'Send on WhatsApp?', btn: 'Send', done: 'Sent · 46 guests came back in 7 days' }] }; },

    reorder: function (p) { return { tab: 'Reorder', kicker: 'Every evening', title: 'Tomorrow’s order, drafted for you', agents: ['Reorder'],
      text: 'The reorder agent checks stock, par levels, tomorrow’s forecast and open orders, then drafts purchase orders by vendor.', outcome: 'Fewer stock-outs and fewer emergency purchases.',
      steps: [{ t: 'levels', title: 'Stock against par level', rows: [[p.ing, 18, 60], ['Coffee beans', 35, 50], ['Sugar', 80, 40], ['Croissants', 20, 70]] },
        { t: 'card', title: 'Purchase order drafted', rows: [[p.ing, '40 L · ' + p.vendor], ['Croissants', '120 · Daily Bake'], ['Coffee beans', '5 kg · Blue Tokai'], ['Total', '₹14,860']] },
        { t: 'ask', who: 'Reorder', text: 'Send these orders to 3 vendors?', btn: 'Approve order', done: 'Orders sent to vendors on WhatsApp' }] }; },

    aggsync: function (p) { return { tab: 'Delivery apps', kicker: 'Lunch', title: 'No brand goes offline unnoticed', agents: ['Aggregator sync'],
      text: 'The agent checks your Swiggy and Zomato listings against Digitory every few minutes: outlets offline, items out of stock, price mismatches.', outcome: 'Fewer lost orders and clean listings on every app.',
      steps: [{ t: 'status', title: 'Listings right now', rows: [['Swiggy · ' + p.venue.split(' ')[0], 'on'], ['Zomato · ' + p.venue.split(' ')[0], 'on'], ['Swiggy · Wrap Lab', 'on'], ['Zomato · Wrap Lab', 'off']] },
        { t: 'msg', who: 'ai', name: 'Aggregator sync', text: 'Wrap Lab has shown offline on Zomato for 40 minutes during lunch. Usual orders in this slot: about 18.' },
        { t: 'ask', who: 'Aggregator sync', text: 'Turn Wrap Lab back on, and fix 3 price mismatches?', btn: 'Fix it', done: 'Back online · prices matched' }] }; },

    brief: function (p) { return { tab: 'Morning brief', kicker: '8:00 AM', title: 'Your whole business, in one message', agents: ['Morning brief', 'Ask anything', 'Approvals inbox'],
      text: 'Yesterday’s numbers, what went wrong and what needs your approval, on WhatsApp before you open. Ask follow-up questions in plain words.', outcome: 'You start the day with decisions, not reports.',
      steps: [{ t: 'chart', title: 'Sales by outlet · yesterday (₹ lakh)', labels: p.outlets > 3 ? ['WF', 'HSR', 'KOR', 'IND', 'JPN', 'MAL', 'BEL', 'ECY'] : ['Koramangala', 'HSR', 'Indiranagar'], values: p.outlets > 3 ? [1.4, 2.1, 2.3, 2.0, 1.7, 1.9, 1.5, 1.3] : [0.8, 0.6, 0.7], hi: [0] },
        { t: 'msg', who: 'ai', name: 'Morning brief', text: 'Yesterday ' + p.sales + ', 6% up on last week. ' + (p.outlets > 3 ? 'Whitefield is lowest and its food cost is 4 points above the group.' : 'Koramangala ran out of croissants at 11:20 AM.') + ' 2 items need your approval.' },
        { t: 'msg', who: 'you', name: 'You', text: 'Why is Whitefield’s food cost high?' },
        { t: 'msg', who: 'ai', name: 'DigiTalk', text: 'Paneer usage is 9% over recipe there, mostly at dinner. The variance agent has flagged it to the outlet manager.' },
        { t: 'ask', who: 'Approvals inbox', text: 'Approve tomorrow’s orders for all outlets (₹2.4L)?', btn: 'Approve', done: 'Approved · orders sent' }] }; },

    booking: function (p) { return { tab: 'Bookings', kicker: 'Afternoon', title: 'Bookings answered in a minute, day or night', agents: ['Booking agent', 'No-show guard'],
      text: 'The booking agent answers WhatsApp and phone requests and books within your rules. Large parties go to the manager.', outcome: 'No missed bookings, and fewer empty tables from no-shows.',
      steps: [{ t: 'msg', who: 'guest', name: 'Guest on WhatsApp', text: 'Table for 4 at 8 tonight? It’s our anniversary.' },
        { t: 'floor', title: 'Tonight at 8 PM', tables: [['T1', 'booked'], ['T2', 'booked'], ['T3', 'free'], ['T4', 'booked'], ['T5', 'free'], ['T6', 'pick'], ['T7', 'booked'], ['T8', 'free'], ['T9', 'booked']] },
        { t: 'msg', who: 'ai', name: 'Booking agent', text: 'Happy anniversary! Window table T6 is confirmed for 4 at 8 PM.' },
        { t: 'msg', who: 'ai', name: 'No-show guard', text: '2 bookings tonight have a high no-show risk. Reminders sent; safe to overbook one table of 2.' },
        { t: 'ask', who: 'No-show guard', text: 'Allow one overbooking at 8:30 PM?', btn: 'Allow', done: 'Allowed · waitlist guest offered 8:30 PM' }] }; },

    guestmem: function (p) { return { tab: 'Guest memory', kicker: 'At the door', title: 'Every guest feels like a regular', agents: ['Guest memory'],
      text: 'When a booking is seated, the captain sees the guest’s history and preferences, shared with their consent.', outcome: 'Personal service, even with new staff.',
      steps: [{ t: 'sys', text: '8:02 PM · T6 seated' },
        { t: 'profile', name: 'Rhea Kapoor', lines: [['Visits', '14'], ['Usual', 'Pinot Noir · Lamb Shank'], ['Avoid', 'No mushrooms'], ['Today', 'Anniversary']] },
        { t: 'ask', who: 'Guest memory', text: 'Send a complimentary dessert with a candle to T6?', btn: 'Send it', done: 'Pastry notified · added to T6' }] }; },

    coursefire: function (p) { return { tab: 'Course timing', kicker: 'Service', title: 'Courses that arrive at the right moment', agents: ['Kitchen pace', 'Table turn'],
      text: 'Captains fire courses from the table app. Kitchen pace watches each station and table turn flags tables sitting long at peak.', outcome: 'Smoother service and more covers in the same hours.',
      steps: [{ t: 'ticket', title: 'Fire mains · T6', lines: ['2 × Lamb Shank', '1 × Dal Bukhara', '1 × Saffron Pulao', 'Course 2 of 3'] },
        { t: 'gauge', label: 'Tandoor ticket time', from: 9, to: 16, unit: ' min', better: false },
        { t: 'msg', who: 'ai', name: 'Kitchen pace', text: 'Tandoor tickets are at 16 minutes. T2 and T9 mains are due in 4 minutes.' },
        { t: 'ask', who: 'Kitchen pace', text: 'Alert the chef de partie and hold T9’s mains by 5 minutes?', btn: 'Alert', done: 'Chef alerted · T9 captain informed' }] }; },

    complaint: function (p) { return { tab: 'Rescue a bad night', kicker: 'During dinner', title: 'Fix it while the guest is still there', agents: ['Complaint recovery', 'Weekly themes'],
      text: 'A low rating reaches the manager in a minute, with the bill, the dishes and an apology ready.', outcome: 'Unhappy guests rescued before they post a review.',
      steps: [{ t: 'msg', who: 'guest', name: 'Feedback · ' + p.outlet, text: '2/5 · Food was cold and took 40 minutes.' },
        { t: 'card', title: 'Context for the manager', rows: [['Table', 'T7 · still seated'], ['Bill', '₹3,450'], ['Server', p.staff], ['Dish', p.dish + ' (late by 22 min)', 'bad']] },
        { t: 'ask', who: 'Complaint recovery', text: 'Send the manager over with an apology and a complimentary dessert?', btn: 'Do it', done: 'Manager at the table · guest updated rating to 4/5' },
        { t: 'chart', title: 'Guest themes this week', labels: ['Slow service', 'Cold food', 'Friendly staff', 'Ambience'], values: [14, 6, 22, 11], hi: [0, 1] }] }; },

    menueng: function (p) { return { tab: 'Menu engineering', kicker: 'Monthly', title: 'Know which dishes earn their place', agents: ['Menu engineering', 'Recipe costing'],
      text: 'Sales and plate cost put every dish into stars, workhorses, puzzles and slow movers, with price and menu suggestions.', outcome: 'Higher margin from the same menu, without guessing.',
      steps: [{ t: 'matrix', title: 'Your menu this month', dots: [['Lamb Shank', 78, 72, 'star'], ['Dal Bukhara', 85, 35, 'work'], ['Saffron Pulao', 30, 70, 'puzzle'], ['Crab Curry', 20, 25, 'dog'], ['Paneer Tikka', 60, 56, 'work']] },
        { t: 'msg', who: 'ai', name: 'Menu engineering', text: 'Dal Bukhara is a workhorse: top 3 in sales but 34% food cost. A ₹60 increase adds about ₹38,000 a month.' },
        { t: 'ask', who: 'Menu engineering', text: 'Raise Dal Bukhara by ₹60 and move Crab Curry off the main card?', btn: 'Approve', done: 'Menu updated · undo available' }] }; },

    commission: function (p) { return { tab: 'Payout check', kicker: 'Weekly', title: 'Get paid what the apps owe you', agents: ['Commission check'],
      text: 'Every aggregator payout is matched with your orders. Wrong commissions and missing payouts are listed with evidence.', outcome: 'Money recovered without hours of spreadsheets.',
      steps: [{ t: 'compare', title: 'Commission charged vs agreed', rows: [['Swiggy', 20, 24, '%'], ['Zomato', 22, 22, '%']] },
        { t: 'msg', who: 'ai', name: 'Commission check', text: 'Swiggy charged 24% on 112 orders last week against your agreed 20%: ₹9,800 overcharged.' },
        { t: 'ask', who: 'Commission check', text: 'Raise the claim with the order list attached?', btn: 'Raise claim', done: 'Claim raised · ₹9,800 credited next cycle' }] }; },

    costdrift: function (p) { var fc = 29, fc2 = 34; return { tab: 'Recipe cost', kicker: 'This week', title: 'Price rises spotted before they eat your margin', agents: ['Recipe costing', 'Recipe cost drift', 'Menu engineering'],
      text: 'Every sale deducts its recipe from stock. When a purchase price changes, plate costs update and the agent tells you which dishes lost margin.', outcome: 'Food cost you can trust, dish by dish.',
      steps: [{ t: 'flow', title: '1 × ' + p.dish + ' sold', nodes: [['receipt', 'Bill'], ['book', 'Recipe'], ['box', 'Stock −'], ['chart', 'Cost']] },
        { t: 'msg', who: 'ai', name: 'Recipe cost drift', text: p.ing + ' from ' + p.vendor + ' is up 14%. ' + p.dish + ' food cost is now ' + fc2 + '%, up from ' + fc + '%. 5 more dishes are affected.' },
        { t: 'gauge', label: p.dish + ' food cost', from: fc, to: fc2, unit: '%', better: false },
        { t: 'ask', who: 'Menu engineering', text: 'Raise ' + p.dish + ' by ₹30, or switch to the second vendor (9% cheaper)?', btn: 'Switch vendor', done: 'Next order goes to the second vendor · food cost back to 30%' }] }; },

    prepforecast: function (p) { return { tab: 'Prep forecast', kicker: 'Evening', title: 'Cook for tomorrow’s demand, not yesterday’s habit', agents: ['Prep forecast', 'Reorder'],
      text: 'The forecast uses order history, weekday, weather and events to set tomorrow’s prep list, then hands it to reorder.', outcome: 'Less food thrown away, fewer “sold out” items.',
      steps: [{ t: 'chart', title: 'Biryani orders forecast · tomorrow by hour', labels: ['11', '12', '1', '2', '3', '7', '8', '9', '10'], values: [8, 26, 34, 18, 6, 22, 38, 41, 20], hi: [7] },
        { t: 'card', title: 'Prep list for tomorrow', rows: [['Chicken Biryani', '120 portions'], ['Veg Biryani', '45 portions'], ['Raita', '160 cups'], ['Why', 'IPL match at 7:30 PM: dinner +25%']] },
        { t: 'ask', who: 'Prep forecast', text: 'Send the prep list to the kitchen and update tomorrow’s rice order?', btn: 'Send', done: 'Kitchen notified · rice order +20 kg' }] }; },

    menuhealth: function (p) { return { tab: 'Menu health', kicker: 'Weekly', title: 'Four brands, one clean menu', agents: ['Menu health', 'Menu change'],
      text: 'The agent scans every brand’s menu for missing taxes and recipes, duplicates and price mismatches across apps.', outcome: 'Fewer billing errors and accurate food cost on every brand.',
      steps: [{ t: 'status', title: 'Menu check · 4 brands', rows: [['Biryani Bros', 'on'], ['Wrap Lab', 'warn'], ['Bowl Co', 'on'], ['Kebab Bar', 'warn']] },
        { t: 'card', title: 'Issues found', rows: [['Items without recipe', '12', 'bad'], ['Duplicate items', '4', 'warn'], ['Price differs Swiggy vs Zomato', '6', 'warn']] },
        { t: 'ask', who: 'Menu health', text: 'Apply the 22 suggested fixes?', btn: 'Apply fixes', done: '22 fixes applied · logged with undo' }] }; },

    indent: function (p) { return { tab: 'Central kitchen', kicker: 'Every evening', title: 'Eight outlets, one production plan', agents: ['Outlet indent', 'Production plan'],
      text: 'Each outlet’s indent is drafted from its own forecast. The production plan combines them into what the central kitchen cooks tomorrow.', outcome: 'The central kitchen cooks to demand; outlets stop over-ordering.',
      steps: [{ t: 'hub', title: 'Indents flowing to the central kitchen', spokes: ['WF', 'HSR', 'KOR', 'IND', 'JPN', 'MAL', 'BEL', 'ECY'], center: 'Central kitchen' },
        { t: 'card', title: 'Tomorrow’s production', rows: [['Makhani gravy', '96 kg'], ['Biryani base', '64 kg'], ['Rotis', '1,600'], ['Short on', 'Tomatoes 40 kg, Butter 12 kg', 'warn']] },
        { t: 'ask', who: 'Production plan', text: 'Lock the plan and order the missing raw materials?', btn: 'Lock plan', done: 'Plan locked · raw material order sent' }] }; },

    balance: function (p) { return { tab: 'Stock balancing', kicker: 'Midweek', title: 'Move stock before it expires', agents: ['Stock balancing'],
      text: 'The agent spots stock idle at one outlet while another runs short, and proposes the transfer.', outcome: 'Fewer emergency buys and less stock thrown away.',
      steps: [{ t: 'levels', title: 'Paneer by outlet (kg)', rows: [['HSR', 23, 8], ['Koramangala', 3, 8], ['Whitefield', 9, 8], ['Indiranagar', 7, 8]] },
        { t: 'msg', who: 'ai', name: 'Stock balancing', text: 'HSR has 15 kg extra paneer expiring Friday; Koramangala runs out by Saturday lunch.' },
        { t: 'ask', who: 'Stock balancing', text: 'Transfer 8 kg from HSR to Koramangala on tomorrow’s van?', btn: 'Transfer', done: 'Transfer note created · van route updated' }] }; },

    menuchange: function (p) { return { tab: 'Menu change', kicker: 'Head office', title: 'Change the menu everywhere with one message', agents: ['Menu change', 'Menu health'],
      text: 'Ask for a change in plain words. The agent copies the setup from a similar item and shows a preview before anything changes.', outcome: 'Menu updates in minutes, consistent at every outlet.',
      steps: [{ t: 'msg', who: 'you', name: 'You', text: 'Add Paneer Roll at ₹240 at all outlets, like Chicken Roll.' },
        { t: 'card', title: 'Preview', rows: [['Item', 'Paneer Roll'], ['Price', '₹240'], ['Category, tax, station', 'Copied from Chicken Roll'], ['Outlets', 'All 8 + Swiggy and Zomato']] },
        { t: 'ask', who: 'Menu change', text: 'Publish to all outlets?', btn: 'Publish', done: 'Live at 8 outlets in 40 seconds · undo available' }] }; },

    paymatch: function (p) { return { tab: 'Payments and Tally', kicker: 'Daily', title: 'Every rupee matched, books posted', agents: ['Payment matching', 'Tally posting'],
      text: 'UPI, card and wallet settlements are matched with bills. Daily sales, purchases and taxes are prepared for Tally for your accountant to approve.', outcome: 'Missing money found daily; books always up to date.',
      steps: [{ t: 'flow', title: 'Daily close', nodes: [['receipt', 'Bills'], ['bank', 'Settlements'], ['chart', 'Matched'], ['book', 'Tally']] },
        { t: 'card', title: 'Yesterday · 8 outlets', rows: [['Bills', '2,914'], ['Matched', '2,911', 'good'], ['UPI short', '₹4,320 · 3 failed at bank', 'bad'], ['Tally entries', '24 vouchers ready']] },
        { t: 'ask', who: 'Tally posting', text: 'Raise the UPI claim and post 24 vouchers to Tally?', btn: 'Approve', done: 'Claim raised · Tally updated' }] }; },

    eventlive: function (p) { return { tab: 'Event live', kicker: 'Saturday · 11 PM', title: 'Move staff to where the crowd is', agents: ['Event live', 'Cashless wallets'],
      text: 'Wallet taps show sales and queues at every bar in real time. The agent tells you which counters to open or staff up.', outcome: 'Shorter queues and more sales at the peak.',
      steps: [{ t: 'queues', title: 'Queue at each bar', bars: [['Bar 1', 7], ['Bar 2', 18], ['Bar 3', 5], ['Bar 4', 0]] },
        { t: 'msg', who: 'ai', name: 'Event live', text: 'Bar 2 has 18 people waiting; Bar 4 has none. Top-ups are 22% above the last event.' },
        { t: 'ask', who: 'Event live', text: 'Move 2 bartenders from Bar 4 to Bar 2?', btn: 'Move them', done: 'Floor manager notified · Bar 2 queue down to 6 in 9 minutes' }] }; },

    kegvar: function (p) { return { tab: 'Keg variance', kicker: 'During the event', title: 'Every pint accounted for', agents: ['Variance and theft', 'Bar stock'],
      text: 'Keg levels are compared with pints sold at each bar, live during the event.', outcome: 'Leaks caught during the event, not after.',
      steps: [{ t: 'bottles', title: 'Pints sold vs poured', items: [['Bar 1', 410, 414], ['Bar 2', 380, 431], ['Bar 3', 290, 293]] },
        { t: 'msg', who: 'ai', name: 'Variance and theft', text: 'Bar 2 poured 51 more pints than it sold (₹19,400). The tap may be leaking or pints are going unbilled.' },
        { t: 'ask', who: 'Variance and theft', text: 'Send the bar captain to check Bar 2?', btn: 'Send', done: 'Captain at Bar 2 · tap 3 found leaking' }] }; },

    support: function (p) { var sc = p === V.events; return { tab: 'Support', kicker: 'When something breaks', title: 'Help in minutes, on WhatsApp', agents: ['Support triage', 'Diagnostics', 'Config agent', 'Digitory support team'],
      text: 'Your team messages the support group as usual. Agents diagnose the problem and prepare the fix; our team steps in when needed.', outcome: 'Most issues fixed in minutes, with people behind every fix.',
      steps: [{ t: 'msg', who: 'you', name: 'Manager', text: sc ? 'Gate B scanner not working, queue building!!' : 'KOT not printing at ' + p.station + '!!' },
        { t: 'status', title: 'Diagnostics', rows: [['POS server', 'on'], ['Internet', 'on'], [sc ? 'Gate B scanner' : p.station + ' printer', 'off']] },
        { t: 'msg', who: 'ai', name: 'Diagnostics', text: sc ? 'The scanner lost Wi-Fi after a router restart. It can switch to the backup network.' : 'The printer’s address changed after a router restart. New address: 192.168.1.52.' },
        { t: 'ask', who: 'Config agent', text: sc ? 'Switch Gate B scanner to the backup network?' : 'Update the printer to its new address?', btn: 'Approve fix', done: sc ? 'Scanner back online · queue moving' : 'Printer back online · test KOT printed' },
        { t: 'msg', who: 'team', name: 'Digitory support team', text: 'Fixed in 2 min 40 s. Logged as DIGI-1642; we’ll make sure it doesn’t happen again.' }] }; },

    refunds: function (p) { return { tab: 'Refunds and report', kicker: 'Morning after', title: 'Close the event cleanly', agents: ['Refunds and matching', 'Event report'],
      text: 'Unspent wallet balances are refunded, gateway records matched, and the full event report is ready by morning.', outcome: 'Happy guests and a closed event, with no manual reconciliation.',
      steps: [{ t: 'chart', title: 'Revenue by hour (₹ lakh)', labels: ['8', '9', '10', '11', '12', '1'], values: [1.2, 2.6, 3.9, 4.8, 3.6, 2.3], hi: [3] },
        { t: 'card', title: 'After Saturday’s event', rows: [['Revenue', '₹18.4L · 12% up'], ['Guests', '3,200'], ['Unspent wallets', '1,240 · ₹3.6L'], ['Gateway mismatches', '4', 'warn']] },
        { t: 'ask', who: 'Refunds and matching', text: 'Approve the refund batch?', btn: 'Approve refunds', done: 'Refunds sent to 1,240 guests' }] }; },

    dayclose: function (p) { return { tab: 'Day close', kicker: '11:50 PM', title: 'A clean close, every night', agents: ['Day close'],
      text: 'Before closing, the agent checks open bills, cash against expected, and unsettled card and UPI payments, then prepares the close.', outcome: 'Cash and payment gaps caught the same night.',
      steps: [{ t: 'status', title: 'Close checklist', rows: [['Open bills', 'warn'], ['Cash drawer', 'warn'], ['Card settlement', 'on'], ['UPI settlement', 'warn']] },
        { t: 'card', title: 'To resolve', rows: [['Open bills', 'T4 and T9'], ['Cash', '₹1,200 short', 'bad'], ['UPI', '1 payment of ₹2,340 pending']] },
        { t: 'ask', who: 'Day close', text: 'Close T4 and T9 as paid by card and record the cash shortage?', btn: 'Close day', done: 'Day closed · report sent to the owner' }] }; },

    billguard: function (p) { return { tab: 'Billing errors', kicker: 'Before service', title: 'Tax mistakes caught before they reach a bill', agents: ['Billing error guard'],
      text: 'The agent checks items, taxes and e-invoice details before they reach a guest’s bill.', outcome: 'No wrong bills, no GST surprises.',
      steps: [{ t: 'card', title: 'Checked 138 items', rows: [['No GST set', '3 items', 'bad'], ['Different GST across outlets', '1 item', 'warn'], ['E-invoice details', 'all fine', 'good']] },
        { t: 'ask', who: 'Billing error guard', text: 'Apply the correct GST to all 4 items?', btn: 'Fix', done: 'Fixed before lunch service' }] }; },

    variance: function (p) { return { tab: 'Variance', kicker: 'Next morning', title: 'Stock that adds up, every day', agents: ['Variance and theft'],
      text: 'What you actually used is compared with what your recipes say you should have used. Unusual gaps are traced to the item, outlet and shift.', outcome: 'Variance found in days, not at the monthly count.',
      steps: [{ t: 'compare', title: 'Expected vs actual use (kg)', rows: [['Chicken', 42, 45.4, ' kg'], [p.ing, 18, 18.3, ' kg'], ['Onions', 60, 61, ' kg']] },
        { t: 'msg', who: 'ai', name: 'Variance and theft', text: 'Chicken is 8% over recipe at ' + p.outlet + ', mostly on Saturday night.' },
        { t: 'ask', who: 'Variance and theft', text: 'Add a portion check for chicken dishes this Saturday?', btn: 'Add check', done: 'Added to the kitchen checklist' }] }; },

    delivery: function (p) { return { tab: 'Delivery check', kicker: 'Goods arrive', title: 'Pay only for what arrived', agents: ['Delivery check', 'Vendor price watch'],
      text: 'Deliveries are matched against the purchase order and the invoice. Short supply and price creep are claimed the same day.', outcome: 'Fewer losses at the back door.',
      steps: [{ t: 'compare', title: 'Ordered vs received', rows: [[p.ing, 20, 17.5, ' kg'], ['Onions', 35, 35, ' kg'], ['Cooking oil', 30, 30, ' L']] },
        { t: 'msg', who: 'ai', name: 'Delivery check', text: p.ing + ': 17.5 kg received but invoiced for 20 kg. Onions billed at ₹42/kg against an order price of ₹36.' },
        { t: 'ask', who: 'Delivery check', text: 'Send the claim of ₹1,270 to the vendors?', btn: 'Send claim', done: 'Claims sent with photos and the PO attached' }] }; },

    mireview: function (p) { return { tab: 'Managed inventory', kicker: 'Every month', title: 'Experts who keep your food cost on target', agents: ['Your Digitory inventory manager', 'Variance and theft'],
      text: 'Your Digitory inventory manager reconciles counts, chases gaps and reviews food cost with you every month.', outcome: 'Professional stock control without hiring a cost controller.',
      steps: [{ t: 'gauge', label: 'Stock variance after 3 months', from: 5.2, to: 1.9, unit: '%', better: true },
        { t: 'msg', who: 'team', name: 'Your Digitory inventory manager', text: 'Monthly review for ' + p.outlet + ': food cost 30.4% (target 31%), variance 1.9%. 4 vendor claims raised, 12 recipes corrected.' },
        { t: 'card', title: 'Actions for next month', rows: [['Kitchen', 'Portion check on chicken dishes'], ['Purchasing', 'Switch onions to the second vendor'], ['Counts', 'Weekly count moves to Monday']] },
        { t: 'ask', who: 'Inventory manager', text: 'Book the review call for Monday at 11 AM?', btn: 'Book call', done: 'Booked · agenda shared on WhatsApp' }] }; },

    reviews: function (p) { return { tab: 'Review replies', kicker: 'Daily', title: 'Every review answered, in your voice', agents: ['Review replies'],
      text: 'Replies to Google and Zomato reviews are drafted for the manager to approve or edit.', outcome: 'Better ratings without hours of writing.',
      steps: [{ t: 'msg', who: 'guest', name: 'Google review · 3★', text: 'Loved the food, but service was slow on Saturday.' },
        { t: 'msg', who: 'ai', name: 'Review replies', text: 'Draft: “Thank you for the kind words on the food, and sorry about Saturday’s wait. We’ve added staff for weekend dinners. Hope to see you again soon!”' },
        { t: 'ask', who: 'Review replies', text: 'Post this reply?', btn: 'Post', done: 'Posted · 6 more drafts waiting' }] }; }
  };

  /* ---------------- playlists ---------------- */
  var VENUE_SETS = { bars: ['onboard', 'pegvar', 'shiftwatch', 'happyhour', 'excise'], cafes: ['onboard', 'kitchenpace', 'winback', 'reorder', 'aggsync'],
    fine: ['booking', 'guestmem', 'coursefire', 'complaint', 'menueng'], cloud: ['aggsync', 'commission', 'costdrift', 'prepforecast', 'menuhealth'],
    chains: ['brief', 'indent', 'balance', 'menuchange', 'paymatch'], events: ['eventlive', 'kegvar', 'support', 'refunds'] };
  var PAGE_SETS = { pos: { p: 'cafes', s: ['kitchenpace', 'shiftwatch', 'billguard', 'dayclose', 'support'] }, inventory: { p: 'chains', s: ['costdrift', 'variance', 'delivery', 'balance', 'mireview'] },
    guests: { p: 'fine', s: ['booking', 'guestmem', 'complaint', 'reviews', 'winback'] }, managed: { p: 'chains', s: ['onboard', 'variance', 'delivery', 'mireview'] } };

  /* ---------------- graphics ---------------- */
  var G = {
    gauge: function (st) {
      var e = el('div', 'sim-card sim-viz'); var col = st.better ? '#11845B' : '#E5531A';
      e.innerHTML = '<b>' + esc(st.label) + '</b><div class="gauge"><svg viewBox="0 0 200 110"><path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#EEF1F4" stroke-width="16" stroke-linecap="round"/><path class="g-arc" d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="' + col + '" stroke-width="16" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/></svg><div class="g-val" style="color:' + col + '">' + st.from + esc(st.unit) + '</div></div><span class="g-note">' + st.from + esc(st.unit) + ' → ' + st.to + esc(st.unit) + '</span>';
      e._play = function () { var max = Math.max(st.from, st.to) * 1.4, arc = e.querySelector('.g-arc'), val = e.querySelector('.g-val');
        arc.style.strokeDashoffset = 100 - st.from / max * 100; return wait(500).then(function () { arc.style.transition = 'stroke-dashoffset 1.4s ease'; arc.style.strokeDashoffset = 100 - st.to / max * 100; return tween(st.from, st.to, 1400, function (v) { val.textContent = (Math.round(v * 10) / 10) + st.unit; }); }); };
      return e;
    },
    chart: function (st) {
      var e = el('div', 'sim-card sim-viz'), mx = Math.max.apply(null, st.values);
      e.innerHTML = '<b>' + esc(st.title) + '</b><div class="bars">' + st.values.map(function (v, i) { var h = st.hi && st.hi.indexOf(i) > -1; return '<div class="bar' + (h ? ' hi' : '') + '"><span class="bv">' + v + '</span><i data-h="' + Math.max(4, v / mx * 100) + '"></i><span class="bl">' + esc(st.labels[i]) + '</span></div>'; }).join('') + '</div>';
      e._play = function () { var bs = e.querySelectorAll('.bar i'); bs.forEach(function (b, i) { setTimeout(function () { b.style.height = b.getAttribute('data-h') + '%'; }, RM ? 0 : i * 90); }); return wait(900 + bs.length * 90); };
      return e;
    },
    bottles: function (st) {
      var e = el('div', 'sim-card sim-viz'), mx = 0; st.items.forEach(function (x) { mx = Math.max(mx, x[2]); });
      e.innerHTML = '<b>' + esc(st.title) + '</b><div class="bottles">' + st.items.map(function (x) { var bad = x[2] - x[1] > x[1] * 0.05;
        return '<div class="btl' + (bad ? ' bad' : '') + '"><svg viewBox="0 0 40 90"><path d="M15 2h10v14l7 10v58a4 4 0 01-4 4H12a4 4 0 01-4-4V26l7-10z" fill="#F6F8FA" stroke="#AABCCC" stroke-width="1.5"/><clipPath id="c' + x[0].replace(/\W/g, '') + '"><path d="M15 2h10v14l7 10v58a4 4 0 01-4 4H12a4 4 0 01-4-4V26l7-10z"/></clipPath><rect class="liq" clip-path="url(#c' + x[0].replace(/\W/g, '') + ')" x="0" y="20" width="40" height="70" fill="' + (bad ? '#E5531A' : '#E8A33D') + '"/></svg><span class="bn">' + esc(x[0]) + '</span><span class="bs">Billed ' + x[1] + '<br>Poured <b>' + x[2] + '</b></span></div>'; }).join('') + '</div>';
      e._play = function () { e.querySelectorAll('.liq').forEach(function (l, i) { var x = st.items[i]; setTimeout(function () { l.setAttribute('y', 20 + 66 * (x[2] / (mx * 1.7))); }, RM ? 0 : 200 + i * 150); }); return wait(1700); };
      return e;
    },
    floor: function (st) {
      var e = el('div', 'sim-card sim-viz');
      e.innerHTML = '<b>' + esc(st.title) + '</b><div class="floor">' + st.tables.map(function (t) { return '<span class="tbl" data-s="' + t[1] + '">' + esc(t[0]) + '</span>'; }).join('') + '</div><div class="legend"><i class="lg booked"></i>Booked <i class="lg free"></i>Free <i class="lg pick"></i>Chosen</div>';
      e._play = function () { var ts = e.querySelectorAll('.tbl'); ts.forEach(function (t, i) { setTimeout(function () { t.classList.add(t.getAttribute('data-s')); }, RM ? 0 : i * 120); }); return wait(400 + ts.length * 120); };
      return e;
    },
    flow: function (st) {
      var e = el('div', 'sim-card sim-viz');
      e.innerHTML = '<b>' + esc(st.title) + '</b><div class="flowv">' + st.nodes.map(function (n, i) { return (i ? '<span class="fl-line"><i></i></span>' : '') + '<span class="fl-node"><span class="fl-ic">' + icon(n[0]) + '</span><span>' + esc(n[1]) + '</span></span>'; }).join('') + '</div>';
      e._play = function () { var ns = e.querySelectorAll('.fl-node'), ls = e.querySelectorAll('.fl-line'); ns.forEach(function (n, i) { setTimeout(function () { n.classList.add('on'); if (ls[i]) ls[i].classList.add('on'); }, RM ? 0 : i * 380); }); return wait(300 + ns.length * 380); };
      return e;
    },
    ticket: function (st) {
      var e = el('div', 'sim-viz ticketwrap');
      e.innerHTML = '<div class="printer">' + icon('printer') + '<span>' + esc(st.title) + '</span></div><div class="ticket"><div class="tk-in">' + st.lines.map(function (l, i) { return '<div' + (i === 0 ? ' class="tk-h"' : '') + '>' + esc(l) + '</div>'; }).join('') + '<div class="tk-t">' + new Date().toTimeString().slice(0, 5) + '</div></div></div>';
      e._play = function () { e.querySelector('.ticket').classList.add('out'); return wait(1300); };
      return e;
    },
    queues: function (st) {
      var e = el('div', 'sim-card sim-viz');
      e.innerHTML = '<b>' + esc(st.title) + '</b>' + st.bars.map(function (b) { var dots = ''; for (var i = 0; i < b[1]; i++) dots += '<i></i>'; return '<div class="qrow' + (b[1] > 12 ? ' long' : '') + '"><span class="qn">' + esc(b[0]) + '</span><span class="qd">' + dots + '</span><span class="qc">' + b[1] + '</span></div>'; }).join('');
      e._play = function () { var ds = e.querySelectorAll('.qd i'); ds.forEach(function (d, i) { setTimeout(function () { d.classList.add('on'); }, RM ? 0 : i * 30); }); return wait(500 + ds.length * 30); };
      return e;
    },
    compare: function (st) {
      var e = el('div', 'sim-card sim-viz'), mx = 0; st.rows.forEach(function (r) { mx = Math.max(mx, r[1], r[2]); });
      e.innerHTML = '<b>' + esc(st.title) + '</b>' + st.rows.map(function (r) { var bad = Math.abs(r[2] - r[1]) > r[1] * 0.04; return '<div class="cmp' + (bad ? ' bad' : '') + '"><span class="cn">' + esc(r[0]) + '</span><div class="cb"><i class="a" data-w="' + (r[1] / mx * 100) + '"></i><i class="b" data-w="' + (r[2] / mx * 100) + '"></i></div><span class="cv">' + r[1] + ' → <b>' + r[2] + '</b>' + esc(r[3]) + '</span></div>'; }).join('') + '<div class="legend"><i class="lg a"></i>Expected <i class="lg b"></i>Actual</div>';
      e._play = function () { e.querySelectorAll('[data-w]').forEach(function (b, i) { setTimeout(function () { b.style.width = b.getAttribute('data-w') + '%'; }, RM ? 0 : i * 140); }); return wait(1400); };
      return e;
    },
    levels: function (st) {
      var e = el('div', 'sim-card sim-viz'), mx = 0; st.rows.forEach(function (r) { mx = Math.max(mx, r[1], r[2]); });
      e.innerHTML = '<b>' + esc(st.title) + '</b>' + st.rows.map(function (r) { var low = r[1] < r[2]; return '<div class="lvlrow' + (low ? ' low' : '') + '"><span class="cn">' + esc(r[0]) + '</span><div class="lb"><i data-w="' + (r[1] / mx * 100) + '"></i><em style="left:' + (r[2] / mx * 100) + '%"></em></div><span class="cv">' + (low ? 'Low' : 'OK') + '</span></div>'; }).join('') + '<div class="legend"><i class="lg par"></i>Par level</div>';
      e._play = function () { e.querySelectorAll('[data-w]').forEach(function (b, i) { setTimeout(function () { b.style.width = b.getAttribute('data-w') + '%'; }, RM ? 0 : i * 120); }); return wait(1300); };
      return e;
    },
    status: function (st) {
      var e = el('div', 'sim-card sim-viz');
      e.innerHTML = '<b>' + esc(st.title) + '</b>' + st.rows.map(function (r) { return '<div class="strow"><span>' + esc(r[0]) + '</span><span class="st-dot" data-s="' + r[1] + '"><i></i>' + (r[1] === 'on' ? 'OK' : r[1] === 'warn' ? 'Check' : 'Down') + '</span></div>'; }).join('');
      e._play = function () { var ds = e.querySelectorAll('.st-dot'); ds.forEach(function (d, i) { setTimeout(function () { d.classList.add('in'); }, RM ? 0 : 300 + i * 260); }); return wait(500 + ds.length * 260); };
      return e;
    },
    matrix: function (st) {
      var e = el('div', 'sim-card sim-viz');
      e.innerHTML = '<b>' + esc(st.title) + '</b><div class="mx"><span class="q q1">Puzzles</span><span class="q q2">Stars</span><span class="q q3">Slow movers</span><span class="q q4">Workhorses</span>' + st.dots.map(function (d) { return '<span class="md ' + d[3] + '" style="left:' + d[1] + '%;bottom:' + d[2] + '%"><i></i><em>' + esc(d[0]) + '</em></span>'; }).join('') + '<span class="ax ax1">Popularity →</span><span class="ax ax2">Margin →</span></div>';
      e._play = function () { var ds = e.querySelectorAll('.md'); ds.forEach(function (d, i) { setTimeout(function () { d.classList.add('on'); }, RM ? 0 : 200 + i * 220); }); return wait(500 + ds.length * 220); };
      return e;
    },
    profile: function (st) {
      var e = el('div', 'sim-card sim-viz');
      e.innerHTML = '<div class="pf"><span class="pf-av">' + esc(st.name.split(' ').map(function (w) { return w[0]; }).join('')) + '</span><div><b>' + esc(st.name) + '</b><span class="pf-tag">★ Regular</span></div></div>' + st.lines.map(function (l) { return '<div class="sim-row in"><span>' + esc(l[0]) + '</span><span>' + esc(l[1]) + '</span></div>'; }).join('');
      e._play = function () { return wait(1200); }; return e;
    },
    hub: function (st) {
      var e = el('div', 'sim-card sim-viz'), n = st.spokes.length, R = 78, cx = 110, cy = 100;
      var s = '<svg viewBox="0 0 220 200" class="hubsvg">';
      st.spokes.forEach(function (sp, i) { var a = i / n * Math.PI * 2 - Math.PI / 2, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
        s += '<line x1="' + x + '" y1="' + y + '" x2="' + cx + '" y2="' + cy + '" class="hl" style="animation-delay:' + (i * 0.15) + 's"/><circle cx="' + x + '" cy="' + y + '" r="15" class="hn"/><text x="' + x + '" y="' + (y + 3.5) + '" text-anchor="middle">' + esc(sp) + '</text>';
        s += '<circle r="3" class="hdot"><animateMotion dur="1.6s" begin="' + (i * 0.2) + 's" repeatCount="indefinite" path="M' + x + ' ' + y + ' L' + cx + ' ' + cy + '"/></circle>'; });
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="30" class="hc"/><text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" class="hct">Central</text><text x="' + cx + '" y="' + (cy + 10) + '" text-anchor="middle" class="hct">kitchen</text></svg>';
      e.innerHTML = '<b>' + esc(st.title) + '</b>' + s; e._play = function () { return wait(1600); }; return e;
    }
  };
  function tween(a, b, ms, f) { return new Promise(function (r) { if (RM) { f(b); return r(); } var t0 = null; function s(t) { if (!t0) t0 = t; var x = Math.min(1, (t - t0) / ms); f(a + (b - a) * (1 - Math.pow(1 - x, 3))); if (x < 1) requestAnimationFrame(s); else r(); } requestAnimationFrame(s); }); }

  /* ---------------- player ---------------- */
  function Sim(root) {
    this.root = root; this.feed = root.querySelector('.sim-feed'); this.side = root.querySelector('.sim-side-body'); this.tabs = root.querySelector('.sim-stages');
    this.page = root.getAttribute('data-set') || ''; this.venue = root.getAttribute('data-venue') || ''; this.run = 0; this.i = 0;
    var self = this;
    root.querySelectorAll('[data-venue-btn]').forEach(function (b) { b.addEventListener('click', function () { self.pick(b.getAttribute('data-venue-btn')); }); });
    if (this.page) { this.venue = PAGE_SETS[this.page].p; this.list = PAGE_SETS[this.page].s; this.ready(); }
    else if (this.venue) { this.list = VENUE_SETS[this.venue]; this.ready(); }
    else this.idle();
  }
  Sim.prototype.ready = function () {
    var self = this, p = V[this.venue];
    this.root.querySelector('.sim-venue-name').textContent = p.venue;
    this.root.querySelectorAll('[data-venue-btn]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-venue-btn') === self.venue ? 'true' : 'false'); });
    this.tabs.innerHTML = ''; this.tabs.hidden = false;
    this.list.forEach(function (k, i) { var b = el('button', 'stab', '<b>' + (i + 1) + '</b>' + esc(S[k](p).tab)); b.type = 'button'; b.setAttribute('role', 'tab'); b.addEventListener('click', function () { self.go(i); }); self.tabs.appendChild(b); });
    this.feed.innerHTML = ''; var box = el('div', 'sim-idle', '<p><b>' + esc(p.venue) + '</b></p><p>' + this.list.length + ' short scenes, each run by an AI agent. Press play and tap approve when asked.</p><button type="button" class="btn btn-primary">Play</button>');
    box.querySelector('button').addEventListener('click', function () { self.go(0); }); this.feed.appendChild(box);
    this.side.innerHTML = '<span class="eyebrow">' + esc(p.label) + '</span><h3>What you’ll see</h3><ul class="sim-list">' + this.list.map(function (k) { var s = S[k](p); return '<li><b>' + esc(s.tab) + '</b> · ' + esc(s.title) + '</li>'; }).join('') + '</ul>';
    var lead = this.root.querySelector('.sim-lead'); if (lead) lead.hidden = true;
    try { sessionStorage.setItem('digitory-venue', this.venue); } catch (e) {}
  };
  Sim.prototype.idle = function () {
    var self = this; this.tabs.hidden = true; this.feed.innerHTML = '';
    var box = el('div', 'sim-idle', '<p><b>What kind of venue do you run?</b></p><p>Pick one to see the AI agents that matter most for it.</p>'), g = el('div', 'sim-idle-grid');
    Object.keys(VENUE_SETS).forEach(function (k) { var b = el('button', 'chip-btn', esc(V[k].label)); b.type = 'button'; b.addEventListener('click', function () { self.pick(k); }); g.appendChild(b); });
    box.appendChild(g); this.feed.appendChild(box);
  };
  Sim.prototype.pick = function (v) { this.venue = v; this.list = VENUE_SETS[v]; this.ready(); this.go(0); };
  Sim.prototype.go = function (i) {
    var self = this, run = ++this.run, p = V[this.venue], s = S[this.list[i]](p); this.i = i;
    [].forEach.call(this.tabs.children, function (b, j) { b.setAttribute('aria-selected', j === i ? 'true' : 'false'); b.classList.toggle('done', j < i); });
    var cur = this.tabs.children[i]; if (cur) this.tabs.scrollLeft = cur.offsetLeft - this.tabs.offsetLeft - 12;
    this.root.querySelector('.sim-progress i').style.width = ((i + 1) / this.list.length * 100) + '%';
    this.side.innerHTML = '<span class="eyebrow">Scene ' + (i + 1) + ' of ' + this.list.length + ' · ' + esc(s.kicker) + '</span><h3>' + esc(s.title) + '</h3><p class="muted">' + esc(s.text) + '</p><div class="sim-agents">' + s.agents.map(function (a) { return '<span class="sim-agent">' + esc(a) + '</span>'; }).join('') + '</div><div class="sim-outcome" hidden><b>What this means for you</b><p>' + esc(s.outcome) + '</p></div><div class="sim-ctrl"></div>';
    this.feed.innerHTML = '';
    this.play(s.steps, run).then(function (ok) { if (ok) self.finish(i, run); });
  };
  Sim.prototype.add = function (n) { this.feed.appendChild(n); var f = this.feed; requestAnimationFrame(function () { n.classList.add('in'); f.scrollTop = f.scrollHeight; }); };
  Sim.prototype.play = async function (steps, run) {
    for (var k = 0; k < steps.length; k++) {
      if (run !== this.run) return false; var st = steps[k];
      if (st.t === 'msg' && st.who !== 'you' && st.who !== 'guest') { var ty = el('div', 'sim-typing', '<i></i><i></i><i></i>'); this.add(ty); await wait(650); if (run !== this.run) return false; ty.remove(); }
      var n = this.render(st); this.add(n);
      if (n._play) { await wait(250); await n._play(); this.feed.scrollTop = this.feed.scrollHeight; await wait(400); }
      else if (st.t === 'prog') await this.count(n, st.to, run);
      else if (st.t === 'ask') { if (!(await this.ask(n, st, run))) return false; }
      else await wait(st.t === 'sys' ? 450 : 1000);
    }
    return run === this.run;
  };
  Sim.prototype.count = function (n, to, run) { var c = n.querySelector('.sim-count'), bar = n.querySelector('.sim-bar i'), self = this;
    return tween(0, to, 1300, function (v) { if (run === self.run) { c.textContent = Math.round(v); bar.style.width = (v / to * 100) + '%'; } }).then(function () { return wait(300); }); };
  Sim.prototype.ask = function (n, st, run) { var self = this, btn = n.querySelector('button');
    return new Promise(function (res) { btn.addEventListener('click', function () { if (run !== self.run) return res(false);
      n.classList.add('ok'); n.querySelector('.sim-ask-act').innerHTML = '<span class="sim-done">✓ ' + esc(st.done) + '</span>'; self.feed.scrollTop = self.feed.scrollHeight; setTimeout(function () { res(run === self.run); }, RM ? 50 : 700); }); }); };
  Sim.prototype.render = function (st) {
    if (G[st.t]) return G[st.t](st);
    var e;
    if (st.t === 'sys') e = el('div', 'sim-sys', esc(st.text));
    else if (st.t === 'msg') { e = el('div', 'sim-msg ' + st.who); e.innerHTML = '<span class="sim-who">' + esc(st.name) + '</span><p>' + esc(st.text) + '</p>' + (st.file ? '<span class="sim-file">PDF · ' + esc(st.file) + '</span>' : ''); }
    else if (st.t === 'card') { e = el('div', 'sim-card'); e.innerHTML = '<b>' + esc(st.title) + '</b>' + st.rows.map(function (r) { return '<div class="sim-row in ' + (r[2] || '') + '"><span>' + esc(r[0]) + '</span><span>' + esc(r[1]) + '</span></div>'; }).join(''); }
    else if (st.t === 'prog') { e = el('div', 'sim-card'); e.innerHTML = '<div class="sim-row in"><span>' + esc(st.label) + '</span><span class="sim-count">0</span></div><div class="sim-bar"><i></i></div>'; }
    else if (st.t === 'ask') { e = el('div', 'sim-ask'); e.innerHTML = '<span class="sim-who">' + esc(st.who) + ' · needs your OK</span><p>' + esc(st.text) + '</p><div class="sim-ask-act"><button type="button" class="sim-approve">' + esc(st.btn) + '</button><span class="sim-hint">Tap to approve</span></div>'; }
    return e;
  };
  Sim.prototype.finish = function (i, run) {
    var self = this, ctrl = this.side.querySelector('.sim-ctrl'); this.side.querySelector('.sim-outcome').hidden = false;
    var rp = el('button', 'btn btn-ghost', 'Replay'); rp.type = 'button'; rp.addEventListener('click', function () { self.go(i); }); ctrl.appendChild(rp);
    if (i < this.list.length - 1) { var nx = el('button', 'btn btn-primary pulse', 'Next: ' + esc(S[this.list[i + 1]](V[this.venue]).tab) + ' →'); nx.type = 'button'; nx.addEventListener('click', function () { self.go(i + 1); }); ctrl.appendChild(nx); }
    else { var lead = this.root.querySelector('.sim-lead'); if (lead) { lead.hidden = false; var t = lead.querySelector('[name=type]'); if (t) t.value = this.venue; var h = lead.querySelector('.sim-lead-venue'); if (h) h.textContent = V[this.venue].label.toLowerCase(); } }
  };

  function init() {
    document.querySelectorAll('[data-sim]').forEach(function (r) { r._sim = new Sim(r); });
    document.querySelectorAll('[data-pick-venue]').forEach(function (b) { b.addEventListener('click', function (e) { var v = b.getAttribute('data-pick-venue'), t = document.querySelector('[data-sim]'); if (!t || t.getAttribute('data-set') || t.getAttribute('data-venue')) return; e.preventDefault(); t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); setTimeout(function () { t._sim.pick(v); }, RM ? 0 : 450); }); });
    document.querySelectorAll('form[data-lead]').forEach(function (f) { f.addEventListener('submit', function (e) { e.preventDefault(); if (!f.reportValidity()) return; f.parentNode.classList.add('sent'); }); });
    try { var v = sessionStorage.getItem('digitory-venue'), sel = document.querySelector('#f-type'); if (v && sel && V[v]) sel.value = v; } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
