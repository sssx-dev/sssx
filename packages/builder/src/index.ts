const cmd = process.argv[2];
if (!["dev", "build", "cluster"].includes(cmd)) {
  console.log(`Please specify command:`);
  console.log(`\tdev – run in development mode`);
  console.log(`\tbuild – run in production mode (and build all)`);
  console.log(
    `\tcluster – run in cluster production mode and use all CPU cores (and build all)`
  );
} else {
  await import(`./${cmd}.ts`);
}

export {};
