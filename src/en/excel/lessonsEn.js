// /en/excel: the English Excel course. Same structure (and same sheet geometry, cell references and
// numbers) as src/excel/excelLessons.js, so the engine checks are identical. Pure data, no imports.
// task.sheet missing -> the task continues from the previous task's sheet.
// task.solution is what "Show me" applies, and what the tests use to prove every task is solvable.

const grid = (rows) => {
  const cells = {}
  rows.forEach((row, r) => row.forEach((v, c) => { if (v !== '' && v != null) cells[String.fromCharCode(65 + c) + (r + 1)] = String(v) }))
  return cells
}

export const LESSONS_EN = [
  {
    slug: 'basics', emoji: '✍️', title: 'Typing in cells', short: 'Cells, typing, fixing and deleting',
    seo: 'Your first Excel lesson: what a cell is, how to type text and numbers, and how to fix and delete them',
    tasks: [
      {
        title: 'Shopping list',
        sheet: { cols: 3, rows: 7, widths: { A: 130 }, cells: grid([['Item', 'Amount'], [], [], ['Eggs', 30], ['Cheese', 2], ['Delete me']]) },
        steps: ['Click cell A2, type Milk and press Enter', 'Click B2 and type 2', 'In row 3: Bread, amount 1'],
        checks: [
          { t: 'val', ref: 'A2', v: 'Milk', label: 'A2 = Milk' },
          { t: 'val', ref: 'B2', v: 2, label: 'B2 = 2' },
          { t: 'val', ref: 'A3', v: 'Bread', label: 'A3 = Bread' },
          { t: 'val', ref: 'B3', v: 1, label: 'B3 = 1' },
        ],
        solution: { cells: { A2: 'Milk', B2: '2', A3: 'Bread', B3: '1' } },
        tip: 'Enter moves down one cell. Tab moves to the next column.',
      },
      {
        title: 'Fix and delete',
        steps: ['30 eggs is a mistake: click B4 and type 12 (typing replaces what was there)', 'Click A6 and press Delete'],
        checks: [
          { t: 'val', ref: 'B4', v: 12, label: 'B4 = 12' },
          { t: 'empty', ref: 'A6', label: 'A6 is empty' },
        ],
        solution: { cells: { B4: '12', A6: '' } },
        tip: 'F2 or a double-click opens the cell for editing without erasing what is inside.',
      },
    ],
  },
  {
    slug: 'formatting', emoji: '🎨', title: 'Format a table', short: 'Select a range, bold and dollar format',
    seo: 'Format a table in Excel: select a range of cells, make text bold and format numbers as dollars',
    tasks: [
      {
        title: 'Bold headings',
        sheet: { cols: 3, rows: 6, widths: { A: 120 }, cells: grid([['Item', 'Price', 'Amount'], ['Shirt', 49.9, 2], ['Pants', 89, 1], ['Socks', 15, 4], ['Hat', 35, 1]]) },
        steps: ['Drag with the mouse from A1 to C1 (or click A1, then Shift+click C1)', 'Click B in the toolbar, or press Ctrl+B'],
        checks: [{ t: 'bold', range: 'A1:C1', label: 'A1:C1 are bold' }],
        solution: { ops: [['bold', 'A1:C1']] },
        tip: 'Shift+arrow keys extend the selection without a mouse.',
      },
      {
        title: 'Prices in dollars',
        steps: ['Select B2 to B5', 'Click $'],
        checks: [{ t: 'cur', range: 'B2:B5', label: 'B2:B5 are in dollars' }],
        solution: { ops: [['cur', 'B2:B5']] },
        tip: 'Formatting only changes how the number looks. The value in the cell is still 49.9.',
      },
    ],
  },
  {
    slug: 'formulas', emoji: '🧮', title: 'Your first formula', short: 'Multiply, add and subtract between cells',
    seo: 'How to write a formula in Excel: the equals sign, cell references, multiplying, adding and subtracting',
    tasks: [
      {
        title: 'How much do the balloons cost?',
        sheet: {
          cols: 4, rows: 9, widths: { A: 110 },
          cells: grid([['What we buy', 'Price', 'Amount', 'Total'], ['Balloons', 2, 30], ['Plates', 0.5, 40], ['Pizza', 45, 4], ['Juice', 8, 6], ['Everything'], [], ['Budget', '', '', 400], ['Left']]),
          fmt: { A1: { b: true }, B1: { b: true }, C1: { b: true }, D1: { b: true } },
        },
        steps: ['Click D2', 'Type =B2*C2 and press Enter'],
        checks: [{ t: 'fx', ref: 'D2', v: 60, label: 'D2 = 60, using a formula' }],
        solution: { cells: { D2: '=B2*C2' } },
        tip: 'You can type = and then click B2 with the mouse instead of typing it.',
      },
      {
        title: 'Every row',
        steps: ['D3: =B3*C3', 'D4: =B4*C4', 'D5: =B5*C5'],
        checks: [
          { t: 'fx', ref: 'D3', v: 20, label: 'D3 = 20' },
          { t: 'fx', ref: 'D4', v: 180, label: 'D4 = 180' },
          { t: 'fx', ref: 'D5', v: 48, label: 'D5 = 48' },
        ],
        solution: { cells: { D3: '=B3*C3', D4: '=B4*C4', D5: '=B5*C5' } },
        tip: 'In lesson 5 you will learn to fill rows like these with a single drag.',
      },
      {
        title: 'Everything together, and what is left',
        steps: ['D6: =D2+D3+D4+D5', 'D9: =D8-D6'],
        checks: [
          { t: 'fx', ref: 'D6', v: 308, label: 'D6 = 308' },
          { t: 'fx', ref: 'D9', v: 92, label: 'D9 = 92' },
        ],
        solution: { cells: { D6: '=D2+D3+D4+D5', D9: '=D8-D6' } },
        tip: 'Change the pizza amount to 5 and watch every total update by itself.',
      },
    ],
  },
  {
    slug: 'sum-average', emoji: '➕', title: 'SUM and AVERAGE', short: 'The total and the average of a column',
    seo: 'The SUM and AVERAGE functions in Excel: the total and the average of a range of cells',
    tasks: [
      {
        title: 'The sum of the scores',
        sheet: {
          cols: 2, rows: 9, widths: { A: 110 },
          cells: grid([['Student', 'Score'], ['Noah', 85], ['Ethan', 92], ['Maya', 78], ['Jonah', 64], ['Sarah', 95], ['Oliver', 70], ['Sum'], ['Average']]),
          fmt: { A1: { b: true }, B1: { b: true } },
        },
        steps: ['B8: type =SUM(', 'Drag from B2 to B7, close the ) and press Enter'],
        checks: [{ t: 'fx', ref: 'B8', fn: 'SUM', v: 484, label: 'B8 = 484, using SUM' }],
        solution: { cells: { B8: '=SUM(B2:B7)' } },
        tip: 'B2:B7 means "from B2 to B7".',
      },
      {
        title: 'The average',
        steps: ['B9: =AVERAGE(B2:B7)'],
        checks: [{ t: 'fx', ref: 'B9', fn: 'AVERAGE', v: 484 / 6, label: 'B9 = 80.67, using AVERAGE' }],
        solution: { cells: { B9: '=AVERAGE(B2:B7)' } },
        tip: 'AVERAGE ignores empty cells, so a student who skipped the test does not pull the average down.',
      },
      {
        title: 'Everything updates',
        steps: ['Maya appealed and got 90: change B4 to 90', 'Watch the sum and the average change by themselves'],
        checks: [
          { t: 'val', ref: 'B4', v: 90, label: 'B4 = 90' },
          { t: 'fx', ref: 'B9', fn: 'AVERAGE', v: 496 / 6, label: 'The average went up to 82.67' },
        ],
        solution: { cells: { B4: '90' } },
        tip: 'This is the power of Excel: change one number and everything is recalculated.',
      },
    ],
  },
  {
    slug: 'autofill', emoji: '⬇️', title: 'Drag and fill', short: 'The fill handle, and $ to lock a cell',
    seo: 'AutoFill in Excel: drag a formula with the fill handle, and use an absolute reference with the $ sign',
    tasks: [
      {
        title: 'One formula, six rows',
        sheet: {
          cols: 4, rows: 7, widths: { A: 100 },
          cells: grid([['Item', 'Price', 'Amount', 'Total'], ['Notebook', 6, 5], ['Pen', 3, 10], ['Backpack', 120, 1], ['Ruler', 4, 2], ['Eraser', 2, 3], ['Crayons', 25, 1]]),
          fmt: { A1: { b: true }, B1: { b: true }, C1: { b: true }, D1: { b: true } },
        },
        steps: ['D2: =B2*C2', 'Click D2 and drag the small square in its corner down to D7', 'On a phone: select D2 to D7 and tap "Fill down ⬇"'],
        checks: [{ t: 'fxRange', range: 'D2:D7', vs: [30, 30, 120, 8, 6, 25], label: 'D2 to D7 are calculated with a formula' }],
        solution: { cells: { D2: '=B2*C2' }, ops: [['fill', 'D2', 'D2:D7']] },
        tip: 'Ctrl+D fills down whatever is in the first row of the selection.',
      },
      {
        title: 'A times table with $',
        sheet: {
          cols: 2, rows: 12, widths: { A: 130 },
          cells: grid([['Times table of', 7], [], [1], [2], [3], [4], [5], [6], [7], [8], [9], [10]]),
          fmt: { A1: { b: true }, B1: { b: true } },
        },
        steps: ['B3: =A3*$B$1', 'Drag B3 down to B12', 'The $ keeps B1 fixed in every row'],
        checks: [
          { t: 'fxRange', range: 'B3:B12', vs: [7, 14, 21, 28, 35, 42, 49, 56, 63, 70], label: 'B3 to B12: 7 to 70' },
          { t: 'fx', ref: 'B12', has: '$B$1', label: 'B12 still points to $B$1' },
        ],
        solution: { cells: { B3: '=A3*$B$1' }, ops: [['fill', 'B3', 'B3:B12']] },
        tip: 'Pressing F4 while you type a formula adds the $ for you.',
      },
      {
        title: 'The table of 9',
        steps: ['Change B1 to 9'],
        checks: [
          { t: 'val', ref: 'B1', v: 9, label: 'B1 = 9' },
          { t: 'fx', ref: 'B12', v: 90, label: 'B12 = 90' },
        ],
        solution: { cells: { B1: '9' } },
        tip: 'Without the $, dragging would move B1 to B2, B3... and the results would be wrong.',
      },
    ],
  },
  {
    slug: 'min-max-count', emoji: '🔢', title: 'MAX, MIN and COUNT', short: 'The most, the least, and how many filled in',
    seo: 'The MAX, MIN, COUNT and COUNTBLANK functions in Excel, with a class trip fund example',
    tasks: [
      {
        title: 'Collecting for a trip',
        sheet: {
          cols: 2, rows: 14, widths: { A: 190 },
          cells: grid([['Name', 'Paid ($)'], ['Daniel', 50], ['Tammy', ''], ['Ryan', 50], ['Leah', 30], ['Nate', ''], ['Hannah', 50], ['Ron', 20], ['Addie', 50], [], ['Highest'], ['Lowest'], ['How many paid'], ['How many have not paid']]),
          fmt: { A1: { b: true }, B1: { b: true } },
        },
        steps: ['B11: =MAX(B2:B9)', 'B12: =MIN(B2:B9)'],
        checks: [
          { t: 'fx', ref: 'B11', fn: 'MAX', v: 50, label: 'B11 = 50, using MAX' },
          { t: 'fx', ref: 'B12', fn: 'MIN', v: 20, label: 'B12 = 20, using MIN' },
        ],
        solution: { cells: { B11: '=MAX(B2:B9)', B12: '=MIN(B2:B9)' } },
        tip: 'MIN ignores empty cells, so it does not return 0.',
      },
      {
        title: 'Who has not paid yet?',
        steps: ['B13: =COUNT(B2:B9) counts cells that hold a number', 'B14: =COUNTBLANK(B2:B9) counts empty cells'],
        checks: [
          { t: 'fx', ref: 'B13', fn: 'COUNT', v: 6, label: 'B13 = 6, using COUNT' },
          { t: 'fx', ref: 'B14', v: 2, label: 'B14 = 2, using a formula' },
        ],
        solution: { cells: { B13: '=COUNT(B2:B9)', B14: '=COUNTBLANK(B2:B9)' } },
        tip: 'COUNTA counts every cell that is not empty, including text.',
      },
    ],
  },
  {
    slug: 'if', emoji: '🔀', title: 'IF: if... then...', short: 'Pass or fail, and COUNTIF',
    seo: 'The IF function in Excel with a passing grade example, and COUNTIF for counting by a condition',
    tasks: [
      {
        title: 'Pass or fail',
        sheet: {
          cols: 3, rows: 9, widths: { A: 140, C: 100 },
          cells: grid([['Student', 'Score', 'Result'], ['Noah', 85], ['Ethan', 48], ['Maya', 72], ['Jonah', 54], ['Sarah', 95], ['Oliver', 55], [], ['How many passed']]),
          fmt: { A1: { b: true }, B1: { b: true }, C1: { b: true } },
        },
        steps: ['C2: =IF(B2>=55,"Pass","Fail")', 'Drag C2 down to C7'],
        checks: [{ t: 'fxRange', range: 'C2:C7', fn: 'IF', vs: ['Pass', 'Fail', 'Pass', 'Fail', 'Pass', 'Pass'], label: 'C2 to C7 use IF' }],
        solution: { cells: { C2: '=IF(B2>=55,"Pass","Fail")' }, ops: [['fill', 'C2', 'C2:C7']] },
        tip: 'IF(condition, value if true, value if false). Text always goes inside quotation marks.',
      },
      {
        title: 'How many passed?',
        steps: ['B9: =COUNTIF(C2:C7,"Pass")'],
        checks: [{ t: 'fx', ref: 'B9', fn: 'COUNTIF', v: 4, label: 'B9 = 4, using COUNTIF' }],
        solution: { cells: { B9: '=COUNTIF(C2:C7,"Pass")' } },
        tip: 'Even =COUNTIF(B2:B7,">=55") gives 4, straight from the scores.',
      },
    ],
  },
  {
    slug: 'sort', emoji: '↕️', title: 'Sort a table', short: 'High to low, and alphabetical',
    seo: 'How to sort a table in Excel from high to low and in alphabetical order, without mixing up the rows',
    tasks: [
      {
        title: 'The leaderboard',
        sheet: {
          cols: 2, rows: 7, widths: { A: 120 },
          cells: grid([['Player', 'Points'], ['Alex', 12], ['Bella', 30], ['Dan', 7], ['Emma', 21], ['Finn', 18], ['Grace', 25]]),
          fmt: { A1: { b: true }, B1: { b: true } },
        },
        steps: ['Click any cell in the Points column', 'Click "Sort high to low"'],
        checks: [{ t: 'sorted', range: 'A2:B7', col: 'B', dir: 'desc', label: 'Sorted by points, high to low, and every name stays with its points' }],
        solution: { ops: [['sort', 'A2:B7', 'B', 'desc']] },
        tip: 'Excel sorts the whole table together, so the names move with the points.',
      },
      {
        title: 'Alphabetical order',
        steps: ['Click a cell in the Player column', 'Click "Sort A→Z / low to high"'],
        checks: [{ t: 'sorted', range: 'A2:B7', col: 'A', dir: 'asc', label: 'Sorted by name, A to Z' }],
        solution: { ops: [['sort', 'A2:B7', 'A', 'asc']] },
        tip: 'The header row does not move when you sort.',
      },
    ],
  },
  {
    slug: 'charts', emoji: '📊', title: 'Your first chart', short: 'A bar chart and a pie chart',
    seo: 'How to make a chart in Excel: a bar chart and a pie chart from a table of expenses',
    tasks: [
      {
        title: 'Bar chart',
        sheet: {
          cols: 2, rows: 6, widths: { A: 120 },
          cells: grid([['Expense', 'Amount'], ['Food', 2400], ['Electricity', 450], ['Gas', 800], ['Activities', 600], ['Fun', 350]]),
          fmt: { A1: { b: true }, B1: { b: true } },
        },
        steps: ['Select A1 to B6', 'Click "📊 Bar chart"'],
        checks: [{ t: 'chart', range: 'A2:B6', kind: 'bar', label: 'A bar chart of A2:B6' }],
        solution: { ops: [['chart', 'A1:B6', 'bar']] },
        tip: 'Change the Activities amount and watch its bar move right away.',
      },
      {
        title: 'Pie chart',
        steps: ['Use the same selection, this time click "🥧 Pie chart"'],
        checks: [{ t: 'chart', range: 'A2:B6', kind: 'pie', label: 'A pie chart of A2:B6' }],
        solution: { ops: [['chart', 'A1:B6', 'pie']] },
        tip: 'A pie shows parts of a whole. Bars are better for comparing.',
      },
    ],
  },
  {
    slug: 'family-budget', emoji: '🏠', title: 'Project: a family budget', short: 'Everything we learned in one sheet',
    seo: 'A family budget in Excel: income, expenses, balance, IF, dollar format and a chart',
    tasks: [
      {
        title: 'Totals',
        sheet: {
          cols: 2, rows: 16, widths: { A: 150, B: 100 },
          cells: grid([['Income', 'Amount'], ['Salary 1', 9000], ['Salary 2', 7500], ['Child benefit', 300], ['Total income'], [], ['Expenses', 'Amount'], ['Rent', 5200], ['Groceries', 3200], ['Utilities', 700], ['Car', 1500], ['Activities', 900], ['Total expenses'], [], ['Balance'], ['Status']]),
        },
        steps: ['B5: the sum of the income', 'B13: the sum of the expenses'],
        checks: [
          { t: 'fx', ref: 'B5', fn: 'SUM', v: 16800, label: 'B5 = 16,800' },
          { t: 'fx', ref: 'B13', fn: 'SUM', v: 11500, label: 'B13 = 11,500' },
        ],
        solution: { cells: { B5: '=SUM(B2:B4)', B13: '=SUM(B8:B12)' } },
        tip: 'In real Excel, Alt+= types SUM for you.',
      },
      {
        title: 'Balance',
        steps: ['B15: income minus expenses', 'B16: an IF that writes "Saving" if the balance is 0 or more, otherwise "Deficit"'],
        checks: [
          { t: 'fx', ref: 'B15', v: 5300, label: 'B15 = 5,300' },
          { t: 'fx', ref: 'B16', fn: 'IF', v: 'Saving', label: 'B16 = Saving, using IF' },
        ],
        solution: { cells: { B15: '=B5-B13', B16: '=IF(B15>=0,"Saving","Deficit")' } },
        tip: 'Try raising the rent to 11,000 and watch B16 flip.',
      },
      {
        title: 'Formatting',
        steps: ['Make A1:B1 and A7:B7 bold', 'Select B2 to B15 and click $'],
        checks: [
          { t: 'bold', range: 'A1:B1', label: 'A1:B1 are bold' },
          { t: 'bold', range: 'A7:B7', label: 'A7:B7 are bold' },
          { t: 'cur', range: 'B2:B15', label: 'All the amounts are in dollars' },
        ],
        solution: { ops: [['bold', 'A1:B1'], ['bold', 'A7:B7'], ['cur', 'B2:B15']] },
        tip: 'After you select a range, Ctrl+B makes all of it bold.',
      },
      {
        title: 'Where does the money go?',
        steps: ['Select A7 to B12', 'Click "🥧 Pie chart"'],
        checks: [{ t: 'chart', range: 'A8:B12', kind: 'pie', label: 'A pie chart of the expenses' }],
        solution: { ops: [['chart', 'A7:B12', 'pie']] },
        tip: 'You finished the course! Now try building the budget for your own home.',
      },
    ],
  },
]

export const lessonBySlugEn = slug => LESSONS_EN.find(l => l.slug === slug)
