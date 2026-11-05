/**
 * WBS Survey Game -> Google Sheet
 *
 * Receives answers from the game and writes ONE ROW PER STUDENT.
 * The game saves after each room, so the same row is updated as the
 * student progresses (matched by the anonymous random "session" code).
 *
 * No names, emails or IP addresses are received or stored.
 * Setup steps: see SETUP.md in the project.
 */

var SHEET_NAME = 'Responses';

// Column order for the Sheet. Any new answer keys are added at the end automatically.
// Written (free-text) answers. If the student played in another language,
// an English translation is added in a "<name>_en" column next to it.
var TEXT_ANSWERS = [
  'assess_problems', 'module_help', 'timetable_changes',
  'raise_programme', 'positive_feedback'
];

var BASE_COLUMNS = [
  'session', 'status', 'updated', 'language', 'gender', 'course', 'course_code',
  // Lecture Theatre
  'assess_concern', 'assess_problems', 'online_offline', 'online_pace',
  // Modules (MBM, MBOM, MINT, MBC only)
  'module_overall', 'module_hardest', 'module_help',
  // Library
  'study_spaces', 'group_sessions',
  // Café
  'timetable_concern', 'timetable_changes', 'commute_ok', 'schedule_pref', 'su_rating',
  // Careers Office
  'careers_rating', 'pg_careers',
  // Suggestion Box & Shout-out Wall
  'raise_programme', 'positive_feedback'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var data = JSON.parse(e.postData.contents);
    if (!data || !data.session) return out_('missing session');

    // translate written answers into English (Google Translate, built into Apps Script)
    var lang = data.language || 'en';
    if (lang !== 'en') {
      TEXT_ANSWERS.forEach(function (k) {
        if (data[k]) {
          try { data[k + '_en'] = LanguageApp.translate(String(data[k]), '', 'en'); }
          catch (err) { data[k + '_en'] = '(translation failed)'; }
        }
      });
    }

    var sheet = getSheet_();
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // add any columns we haven't seen before
    Object.keys(data).forEach(function (k) {
      if (headers.indexOf(k) === -1) {
        headers.push(k);
        sheet.getRange(1, headers.length).setValue(k);
      }
    });

    var row = headers.map(function (h) {
      var v = data[h];
      if (v === undefined || v === null) return '';
      v = String(v);
      // stop spreadsheet formula injection from free-text answers
      if (/^[=+\-@]/.test(v)) v = "'" + v;
      return v.slice(0, 5000);
    });

    // update this student's existing row, or add a new one
    var found = sheet.getRange('A:A').createTextFinder(String(data.session)).matchEntireCell(true).findNext();
    if (found && found.getRow() > 1) {
      sheet.getRange(found.getRow(), 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }
    return out_('ok');
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return out_('WBS survey endpoint is running.');
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, BASE_COLUMNS.length).setValues([BASE_COLUMNS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function out_(msg) {
  return ContentService.createTextOutput(msg).setMimeType(ContentService.MimeType.TEXT);
}
