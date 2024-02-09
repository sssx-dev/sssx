const cmd = process.argv[2];
if (cmd !== "build" && cmd !== "dev") {
  console.log(`Please specify command:`);
  console.log(`\tdev – run in development mode`);
  console.log(`\tbuild – run in production mode (and build all)`);
} else {
  await import(`./${cmd}.ts`);
}

export {};
