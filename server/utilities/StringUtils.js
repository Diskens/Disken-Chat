
exports.isLegalName = (name) => {
  var lower = 'qwertyuiopasdfghjklzxcvbnm';
  var upper = lower.toUpperCase();
  var other = ' 0123456789,.<>(){}[];:!%^&*-_=+';
  var legal = lower + upper + other;
  for (var char of name) { if (!legal.includes(char)) return false; }
  return true;
}

exports.isOfLength = (data, min, max) => {
  return data.length <= max && data.length >= min;
}
