/** Provides graph state to React components. */
import { createContext,useContext } from "react";
export const GraphRuntimeContext=createContext({}); export const useGraph=()=>useContext(GraphRuntimeContext);
