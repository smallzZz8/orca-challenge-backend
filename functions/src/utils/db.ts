interface IAggregateOptions {
  match?: any;
  project?: any;
  sort?: any;
  lookup?: any;
  addFields?: any;
  limit?: number;
  offset?: number;
  pipeline?: any[];
}

// database utility function to add something to the database
export const addItemToDb = async (
  Model: any,
  data: any,
  returnFullObject?: boolean
): Promise<any> => {
  try {
    const result = await Model.create(data);
    if (returnFullObject) {
      return result;
    } else {
      return result.id;
    }
  } catch (e: any) {
    console.error({
      message: "Error adding item to db",
      data: { message: e.message, data },
    });
    return null;
  }
};

// database utility function to get something from the database
export const getOneFromDb = async (
  Model: any,
  queries: any
): Promise<any | null> => {
  try {
    const result = await Model.findOne(queries);
    if (!result) {
      return null;
    }
    return result._doc;
  } catch (e: any) {
    console.error({ message: "Error getting item from db", data: e.message });
    return null;
  }
};

// database utility function to get many things from the database
export const getManyFromDb = async (
  Model: any,
  queries: any,
  orderBy?: any,
  limit?: number,
  offset?: number,
  select?: string | object
): Promise<any[] | null> => {
  try {
    let query = Model.find(queries);

    if (orderBy) {
      query = query.sort(orderBy);
    }
    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.skip(offset);
    }
    if (select) {
      query = query.select(select);
    }

    const result = await query;
    if (!result) {
      return [];
    }

    return result.map((r: any) => r._doc);
  } catch (e: any) {
    console.error({
      message: "Error getting items from db",
      data: {
        error: e,
        message: e?.message,
      },
    });
    return null;
  }
};

// database utility function to perform an aggregate pipeline
export const executeAggregateFromDb = async (
  Model: any,
  {
    match,
    project,
    sort,
    lookup,
    addFields,
    limit,
    offset,
    pipeline,
  }: IAggregateOptions
): Promise<any[] | null> => {
  try {
    let query;
    if (pipeline !== undefined) {
      query = Model.aggregate(pipeline);
    } else {
      query = Model.aggregate();
      if (match) {
        query = query.match(match);
      }
      if (sort) {
        query = query.sort(sort);
      }
      if (offset) {
        query = query.skip(offset);
      }
      if (limit) {
        query = query.limit(limit);
      }
      if (lookup) {
        query = query.lookup(lookup);
      }
      if (addFields) {
        query = query.addFields(addFields);
      }
      if (project) {
        query = query.project(project);
      }
    }

    const result = await query;
    if (!result) {
      return [];
    }

    return result;
  } catch (e: any) {
    console.error({
      message: "Error getting items from db - executeAggregateFromDb",
      data: {
        error: e,
        message: e?.message,
      },
    });
    return null;
  }
};

// database utility function to update something in the database
export const updateItemInDb = async (
  Model: any,
  id: string,
  data: any
): Promise<any> => {
  try {
    const result = await Model.findByIdAndUpdate(id, data, { new: true });
    return result._doc;
  } catch (e: any) {
    console.error({ message: "Error updating item in db", data: e.message });
    return false;
  }
};

// database utility function to upsert something in the database
export const upsertItemInDb = async (
  Model: any,
  query: any,
  data: any
): Promise<any> => {
  try {
    return new Promise((resolve, reject) => {
      Model.findOneAndUpdate(query, data, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
    });
  } catch (e: any) {
    console.error({
      message: "Error upserting item in db",
      data: e.message,
    });
    return false;
  }
};

// database utility function to remove something from the database
export const removeItemFromDb = async (
  Model: any,
  id: string
): Promise<boolean> => {
  try {
    const result = await Model.findByIdAndUpdate(id, {
      deleted: true,
      deletedAt: Date.now(),
    });
    return result;
  } catch (e: any) {
    console.error({
      message: "Error removing item from db",
      data: {
        error: e,
      },
    });
    return false;
  }
};

// database utility function to batch update multiple items in the database
export const batchUpdateItemsInDb = async (
  Model: any,
  queries: any,
  data: any
): Promise<boolean> => {
  try {
    await Model.updateMany(queries, data);
    return true;
  } catch (e: any) {
    console.log("Error batch updating items in db", e);
    console.error({
      message: "Error batch updating items in db",
      data: { error: e },
    });
    return false;
  }
};

// database utility function to format a query
export const formatQueries = (queries: any[]) => {
  return queries.map((q) => {
    return {
      field: q[0],
      operator: q[1],
      value: q[2],
    };
  });
};

// database utility function to format sorting
export const formatSorting = (orderBy: any[]) => {
  return orderBy.map((o) => {
    return {
      field: o[0],
      direction: o[1],
    };
  });
};

// database utility function to full delete something from the database (should only be used for unit tests)
export const fullDeleteItemFromDb = async (
  Model: any,
  queries: any
): Promise<boolean> => {
  try {
    await Model.deleteOne(queries);
    return true;
  } catch (e: any) {
    console.error({
      message: "Error full deleting item from db",
      data: {
        error: e,
      },
    });
    return false;
  }
};
