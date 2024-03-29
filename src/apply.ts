import * as R from "ramda";
import { At, Key, Path } from "./types/paths.js";
import { Op } from "./types/ops.js";

export function get<T extends object, P extends Key[]>(
  obj: T,
  path: P extends Path<T, P> ? P : Path<T, P>,
): At<T, P> {
  return R.path(path as P, obj) as any;
}

export function set<T extends object, P extends Key[]>(
  obj: T,
  path: P extends Path<T, P> ? P : Path<T, P>,
  value: At<T, P>,
): T {
  return R.assocPath(path as P, value, obj) as any;
}

/** Sets `path` to `undefined` */
export function remove<
  T extends object,
  P extends Key[],
  V = At<T, P>,
>(
  obj: T,
  path: P extends Path<T, P> ? (V extends undefined ? P : never) : Path<T, P>,
): T {
  return R.dissocPath(path as Key[], obj) as any;
}

export function copy<
  T extends object,
  From extends Key[],
  To extends Key[],
  FromType = At<T, From>,
  ToType = At<T, To>,
>(
  obj: T,
  from: From extends Path<T, From> ? From : Path<T, From>,
  to: To extends Path<T, To> ? (FromType extends ToType ? To : never)
    : Path<T, To>,
): T {
  const val = get(obj, from as any);
  return set(obj, to as any, val);
}

export function move<
  T extends object,
  From extends Key[],
  To extends Key[],
  FromType = At<T, From>,
  ToType = At<T, To>,
>(
  obj: T,
  from: From extends Path<T, From> ? From : Path<T, From>,
  to: To extends Path<T, To> ? (FromType extends ToType ? To : never)
    : Path<T, To>,
): T {
  const val = get(obj, from as any);
  const deleted = remove(obj, from as any);
  return set(deleted, to as any, val);
}

export function swap<
  T extends object,
  P1 extends Key[],
  P2 extends Key[],
  V1 = At<T, P1>,
  V2 = At<T, P2>,
>(
  obj: T,
  path1: P1 extends Path<T, P1> ? (V1 extends V2 ? P1 : never) : Path<T, P1>,
  path2: P2 extends Path<T, P2> ? (V2 extends V1 ? P2 : never) : Path<T, P2>,
): T {
  const val1 = get(obj, path1);
  const val2 = get(obj, path2);
  const obj1 = R.assocPath(path2 as Key[], val1, obj);
  return R.assocPath(path1 as Key[], val2, obj1);
}

export function apply<T extends object, P extends Key[], P2 extends Key[]>(
  obj: T,
  op: Op<T, P, P2>,
): T {
  switch (op.op) {
    case "set":
      return set(obj, op.path as any, op.value);
    case "remove":
      return remove(obj, op.path as any);
    case "move":
      return move(obj, op.from as any, op.to as any);
    case "copy":
      return copy(obj, op.from as any, op.to as any);
    case "swap":
      return swap(obj, op.path1 as any, op.path2 as any);
  }
}

export function applies<
  T extends object,
  P extends (unknown & Key)[],
  P2 extends (unknown & Key)[],
>(
  obj: T,
  ops: Op<T, P, P2>[],
): T {
  return ops.reduce(apply, obj);
}
