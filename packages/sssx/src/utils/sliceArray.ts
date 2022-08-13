/**
 * Slice array in N equally sized slices, where the last slice includes the rest.
 * @param array – input array that will be sliced @example [0,1,2,3,4,5,6,7,8,9]
 * @param batchSize - size of a slice, @example 3
 * @returns [[0,1,2], [3,4,5], [6,7,8,9]]
 */
export const sliceArray = <T>(array:T[], batchSize:number):Array<T[]> => {
    const LENGTH = array.length
    const numberOfBatches = Math.floor(LENGTH / batchSize)

    let result:Array<T[]> = []

    for(let i=0;i<numberOfBatches;i++){
        const start = i*batchSize
        const end = (start + batchSize) < LENGTH
        ? start + batchSize
        : LENGTH
        const batch = array.slice(start, end)
        result.push(batch)
    }

    return result
}