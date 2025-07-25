module.exports = 'SvgMock';
module.exports.ReactComponent = 'SvgMock';

const React = require('react');
module.exports = function SvgMock(props) {
  return React.createElement('svg', props, null);
};