import readline from 'readline';

export const askQuestion = (query: string) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) =>
    rl.question(`${query} yN\n`, (answer: string) => {
      rl.close();
      const flag = ['y', 'yes'].includes(answer.toLowerCase().trim());
      resolve(flag);
    })
  );
};
