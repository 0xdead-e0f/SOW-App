import React, { useState, useEffect } from "react";
import { TextField, Button, Typography } from "@material-ui/core";
import Layout from "../components/Layout";

import SearchNS from "../components/SearchNS";
interface SearchResult {
  name: string;
  status: string;
  contractAddress: string;
  price: Number;
  canRegister: boolean;
}

const namePrefixArray = [
  "eth",
  "bnb",
  "crypto",
  "bit",
  "zk",
  "osmo",
  "stars",
  "sol",
  "apt",
  "sui",
];

function SearchPage() {
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");

  const handleSearch = async () => {
    if (name.length < 3) {
      alert("The domain name must be at least 3 characters.");
      return;
    }
    setQuery(name);
  };

  useEffect(() => {}, [query]);

  return (
    <Layout title="Dotlab Aggregator">
      {/* <div className="w-full flex flex-col h-[90vh] bg-white gap-2"> */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "100px",
          //   alignItems: "center",
          height: "90vh",
        }}
      >
        <div>
          <Typography variant="h4">Search Domain Name</Typography>
          <div>
            <TextField
              label="Search"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={handleSearch}>
              Search
            </Button>
          </div>
          <div>
            {namePrefixArray.map((prefix) => (
              <SearchNS key={prefix} prefix={prefix} query={query} />
            ))}
          </div>
        </div>
        {/* <div
          className={`${loading ? "visible" : "invisible"} absolute z-50 top-0
              w-full h-full flex flex-col items-center justify-center bg-black/20`}
        >
          <div className="mx-10 flex h-[100px] w-[300px] flex-col items-center justify-center rounded-3xl bg-black/20 px-4">
            <div className="loading-spinner "></div>
            <span className="pt-[5px] text-[14px] text-white">
              Processing...
            </span>
          </div>
        </div> */}
      </div>
    </Layout>
  );
}

export default SearchPage;
