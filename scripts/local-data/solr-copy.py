#!/usr/bin/env python3
"""Copy documents from one Solr collection to another (e.g. dev -> local) with cursorMark paging.

Only stored / docValues fields can be read back, so the target re-derives everything else (copyFields).
Fields that are the destination of a copyField in the target schema are dropped from the documents,
otherwise Solr would receive them twice.

Usage: solr-copy.py SOURCE_URL TARGET_URL COLLECTION [--query Q] [--max-docs N] [--batch N] [--keep-existing]
  e.g. solr-copy.py http://127.0.0.1:18983/solr http://localhost:8983/solr bie
"""
import argparse
import json
import sys
import urllib.parse
import urllib.request


def request(url, data=None, timeout=300):
    headers = {"Content-Type": "application/json"} if data is not None else {}
    req = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.load(resp)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("source")
    parser.add_argument("target")
    parser.add_argument("collection")
    parser.add_argument("--target-collection", help="defaults to COLLECTION")
    parser.add_argument("--query", default="*:*")
    parser.add_argument("--max-docs", type=int, default=0, help="0 = all")
    parser.add_argument("--batch", type=int, default=1000)
    parser.add_argument("--keep-existing", action="store_true", help="do not delete the target documents first")
    args = parser.parse_args()

    src = f"{args.source.rstrip('/')}/{args.collection}"
    dst = f"{args.target.rstrip('/')}/{args.target_collection or args.collection}"

    unique_key = request(f"{dst}/schema/uniquekey?wt=json")["uniqueKey"]
    copy_dests = {cf["dest"] for cf in request(f"{dst}/schema/copyfields?wt=json")["copyFields"]}
    drop = copy_dests | {"_version_", "_root_"}

    total = request(f"{src}/select?" + urllib.parse.urlencode({"q": args.query, "rows": 0, "wt": "json"}))["response"]["numFound"]
    wanted = min(total, args.max_docs) if args.max_docs else total
    print(f"{args.collection}: {total} documents match {args.query!r}, copying {wanted}", flush=True)

    if not args.keep_existing:
        request(f"{dst}/update?commit=true", json.dumps({"delete": {"query": "*:*"}}).encode())

    cursor, copied = "*", 0
    while copied < wanted:
        rows = min(args.batch, wanted - copied)
        params = {"q": args.query, "rows": rows, "sort": f"{unique_key} asc", "cursorMark": cursor, "fl": "*", "wt": "json"}
        page = request(f"{src}/select?" + urllib.parse.urlencode(params))
        docs = [{k: v for k, v in d.items() if k not in drop} for d in page["response"]["docs"]]
        if not docs:
            break
        request(f"{dst}/update?commitWithin=60000", json.dumps(docs).encode())
        copied += len(docs)
        print(f"  {copied}/{wanted}", flush=True)
        if page["nextCursorMark"] == cursor:
            break
        cursor = page["nextCursorMark"]

    request(f"{dst}/update?commit=true", b"{}")
    print(f"{args.collection}: copied {copied} documents", flush=True)


if __name__ == "__main__":
    try:
        main()
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code} for {e.url}: {e.read().decode(errors='replace')[:2000]}", file=sys.stderr)
        sys.exit(1)
