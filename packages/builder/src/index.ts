const [cmd, ...params] = process.argv.slice(2);

if (!["dev", "build", "cluster", "clean"].includes(cmd)) {
  console.log(`Please specify command:`);
  console.log(`\tdev – run in development mode`);
  console.log(
    `\t\tdev open – if you want to open url in browser automatically`
  );
  console.log(`\tbuild – run in production mode (and build all)`);
  console.log(
    `\tcluster – run in cluster production mode and use all CPU cores (and build all)`
  );
  console.log(`\clean – cleans existing files`);
} else {
  await import(`./${cmd}.ts`);
}

export {};
