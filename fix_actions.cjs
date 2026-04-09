const fs = require('fs');
const path = './src/hooks/useAppStore.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/pushToCloud\('SAVE_REPORT', newReport\)/g, "pushToCloud('CREATE_REPORT', newReport)");
content = content.replace(/pushToCloud\('SAVE_REPORT', updatedReport\)/g, "pushToCloud('UPDATE_REPORT', updatedReport)");

content = content.replace(/pushToCloud\('SAVE_INTERNAL_REPORT', newReport\)/g, "pushToCloud('CREATE_INTERNAL_REPORT', newReport)");
content = content.replace(/pushToCloud\('SAVE_INTERNAL_REPORT', updatedReport\)/g, "pushToCloud('UPDATE_INTERNAL_REPORT', updatedReport)");

content = content.replace(/pushToCloud\('SAVE_TRANSACTION', newTransaction\)/g, "pushToCloud('CREATE_TRANSACTION', newTransaction)");
content = content.replace(/pushToCloud\('SAVE_TRANSACTION', updatedTransaction\)/g, "pushToCloud('UPDATE_TRANSACTION', updatedTransaction)");

content = content.replace(/pushToCloud\('SAVE_STUDENT', newStudent\)/g, "pushToCloud('CREATE_STUDENT', newStudent)");
content = content.replace(/pushToCloud\('SAVE_STUDENT', updatedStudent\)/g, "pushToCloud('UPDATE_STUDENT', updatedStudent)");

content = content.replace(/pushToCloud\('SAVE_STUDENT_ADMINISTRATION', newAdmin\)/g, "pushToCloud('CREATE_STUDENT_ADMINISTRATION', newAdmin)");
content = content.replace(/pushToCloud\('SAVE_STUDENT_ADMINISTRATION', adminToUpdate\)/g, "pushToCloud('UPDATE_STUDENT_ADMINISTRATION', adminToUpdate)");

content = content.replace(/pushToCloud\('SAVE_MARKETING_REPORT', newReport\)/g, "pushToCloud('CREATE_MARKETING_REPORT', newReport)");
content = content.replace(/pushToCloud\('SAVE_MARKETING_REPORT', reportToUpdate\)/g, "pushToCloud('UPDATE_MARKETING_REPORT', reportToUpdate)");

content = content.replace(/pushToCloud\('SAVE_ADMIN_REPORT', newReport\)/g, "pushToCloud('CREATE_ADMIN_REPORT', newReport)");
content = content.replace(/pushToCloud\('SAVE_ADMIN_REPORT', reportToUpdate\)/g, "pushToCloud('UPDATE_ADMIN_REPORT', reportToUpdate)");

content = content.replace(/pushToCloud\('SAVE_SURAT', newSurat\)/g, "pushToCloud('CREATE_SURAT', newSurat)");
content = content.replace(/pushToCloud\('SAVE_SURAT', suratToUpdate\)/g, "pushToCloud('UPDATE_SURAT', suratToUpdate)");

content = content.replace(/pushToCloud\('SAVE_INVENTARIS', newInventaris\)/g, "pushToCloud('CREATE_INVENTARIS', newInventaris)");
content = content.replace(/pushToCloud\('SAVE_INVENTARIS', inventarisToUpdate\)/g, "pushToCloud('UPDATE_INVENTARIS', inventarisToUpdate)");

content = content.replace(/pushToCloud\('SAVE_EMPLOYEE', newEmployee\)/g, "pushToCloud('CREATE_EMPLOYEE', newEmployee)");
content = content.replace(/pushToCloud\('SAVE_EMPLOYEE', employeeToUpdate\)/g, "pushToCloud('UPDATE_EMPLOYEE', employeeToUpdate)");

content = content.replace(/pushToCloud\('SAVE_ATTENDANCE', newAttendance\)/g, "pushToCloud('CREATE_ATTENDANCE', newAttendance)");
content = content.replace(/pushToCloud\('SAVE_ATTENDANCE', attendanceToUpdate\)/g, "pushToCloud('UPDATE_ATTENDANCE', attendanceToUpdate)");

content = content.replace(/pushToCloud\('SAVE_LEAVE_REQUEST', newLeaveRequest\)/g, "pushToCloud('CREATE_LEAVE_REQUEST', newLeaveRequest)");
content = content.replace(/pushToCloud\('SAVE_LEAVE_REQUEST', leaveRequestToUpdate\)/g, "pushToCloud('UPDATE_LEAVE_REQUEST', leaveRequestToUpdate)");

content = content.replace(/pushToCloud\('SAVE_SETTINGS', updated\)/g, "pushToCloud('UPDATE_SETTINGS', updated)");

fs.writeFileSync(path, content);
console.log('Done');
