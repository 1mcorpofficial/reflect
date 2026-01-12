// This file is loaded by ts-node to resolve path aliases
import { register } from "tsconfig-paths/register";

register({
  baseUrl: __dirname,
  paths: {
    "@/*": ["./src/*"],
  },
});

