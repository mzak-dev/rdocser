/** Provides document manifest data to React components. */
import { createContext,useContext } from "react";
export const DocumentRuntimeContext=createContext<unknown[]>([]); export const useDocuments=()=>useContext(DocumentRuntimeContext);
