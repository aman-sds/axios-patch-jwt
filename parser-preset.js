module.exports = {
  parserOpts: {
    headerPattern: /^(\[(?:#[A-Z]{2,4}-\d+(?:, |\]))+) (\w+): (.*)$/,
    headerCorrespondence: ['ticket', 'type', 'subject']
  }
};
