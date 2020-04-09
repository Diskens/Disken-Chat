const NedbDatastore = require('nedb-async').default;
const nonRecursiveObjects = [null, undefined, Array];

exports.Datastore = class Datastore extends NedbDatastore {
  async updateEntry(query, newData) {
    var baseObject = await this.asyncFindOne(query);
    if (baseObject == null) throw 'QueryNotFoundError';
    // console.log('[Datastore] baseObject =', baseObject);
    var result = this.updateObject(baseObject, newData);
    delete result._id
    // console.log('[Datastore] Result =', result);
    await this.remove(query);
    await this.insert(result);
  }
  updateObject(baseObject, newData) {
    // console.log('[Datastore] Updating\n', baseObject,
    //  '\nwith\n', newData, '\n----------------');
    for (var [key, value] of Object.entries(newData)) {
      if (typeof value == 'object' && !nonRecursiveObjects.includes(value) && !Array.isArray(value)) {
        // console.log(`[Datastore] entering recursion at key ${key}`);
        baseObject[key] = this.updateObject(baseObject[key], newData[key]);
      } else
        baseObject[key] = value;
    }
    return baseObject;
  }
}
