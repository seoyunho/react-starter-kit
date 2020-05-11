#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const rootPath = path.join(__dirname);
const packagesPath = path.join(rootPath, "packages");
const packagePathsByName = {};
fs.readdirSync(packagesPath).forEach((name) => {
  const packagePath = path.join(packagesPath, name);
  const packageJson = path.join(packagePath, "package.json");
  if (fs.existsSync(packageJson)) {
    packagePathsByName[name] = packagePath;
  }
});

Object.keys(packagePathsByName).forEach((name) => {
  const packageJson = path.join(packagePathsByName[name], "package.json");
  const json = JSON.parse(fs.readFileSync(packageJson, "utf8"));

  // package에 있는 것들을 판단하고, 이를
  Object.keys(packagePathsByName).forEach((otherName) => {
    if (json.dependencies && json.dependencies[otherName]) {
      json.dependencies[otherName] = "file:" + packagePathsByName[otherName];
    }
    if (json.devDependencies && json.devDependencies[otherName]) {
      json.devDependencies[otherName] = "file:" + packagePathsByName[otherName];
    }
    if (json.peerDependencies && json.peerDependencies[otherName]) {
      json.peerDependencies[otherName] =
        "file:" + packagePathsByName[otherName];
    }
    if (json.optionalDependencies && json.optionalDependencies[otherName]) {
      json.optionalDependencies[otherName] =
        "file:" + packagePathsByName[otherName];
    }
  });

  fs.writeFileSync(packageJson, JSON.stringify(json, null, 2), "utf8");
  console.log(
    "Replaced local dependencies in packages/" + name + "/package.json"
  );
});

// Now run the CRA command
const craScriptPath = path.join(packagesPath, "react-start-kit", "index.js");
cp.execSync(`node ${craScriptPath}"`, {
  cwd: rootPath,
  stdio: "inherit",
});
