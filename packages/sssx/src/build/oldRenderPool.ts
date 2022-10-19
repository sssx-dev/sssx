// public _renderPool = async (renderOptions: RenderOptions = defaultRenderOptions) => {
//   const options = Object.assign({}, defaultRenderOptions, renderOptions);
//   const numberOfWorkers = os.cpus().length;

//   const pool = workerpool.pool(path.resolve(__dirname, 'worker.js'), {
//     minWorkers: numberOfWorkers,
//     maxWorkers: numberOfWorkers,
//     workerType: 'process'
//   });

//   await this.prepareRoutes();
//   await this.generateRequests(options.routes, options.updatesOnly);

//   const LENGTH = this.addedRoutes.length;
//   const batchSize = Math.ceil(LENGTH / numberOfWorkers);
//   const numberOfBatches = Math.floor(LENGTH / batchSize);

//   const array: Array<Request[]> = sliceArray(this.addedRoutes, batchSize);

//   this.log(`Starting with ${numberOfBatches} batches:`);

//   const promises = [];
//   for (let i = 0; i < array.length; i++) {
//     const batch = array[i];
//     this.log(`Batched`, batch.length);
//     const promise = pool.exec('render', [batch]);
//     promises.push(promise);
//   }

//   // TODO: add progress bar
//   const before = new Date().getTime();
//   await Promise.all(promises);
//   const after = new Date().getTime();
//   const delta = after - before;

//   Logger.log(`DONE ${(delta / 1000).toFixed(2)} seconds`);
//   await pool.terminate();
// };

export {};
