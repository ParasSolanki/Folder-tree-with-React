import { createContext, useContext, useState } from "react";

export interface RawFile {
  name: string;
}

export interface File extends RawFile {
  isFile: true;
  isDirectory?: never;
  files?: never;
}

export interface Directory extends RawFile {
  isFile?: never;
  isDirectory: true;
  files: Record<string, Directory | File>;
}

export type FileSystem = Record<string, Directory | File>;

type CreateType = "file" | "folder";

interface FileTreeContextProps {
  fileTree?: FileSystem;
  selectedPath?: string;
  createType?: CreateType;
  setSelectedPath: (path: string | undefined) => void;
  setCreateType: React.Dispatch<React.SetStateAction<CreateType | undefined>>;
  onCreate: (data: {
    name: string;
    path: string | undefined;
    type: "file" | "folder";
  }) => void;
}

const FileTreeContext = createContext<FileTreeContextProps | undefined>(
  undefined
);
FileTreeContext.displayName = "FileTreeContext";

export function FileTreeProvider({ children }: React.PropsWithChildren) {
  const [selectedPath, setSelectedPath] = useState<string>();
  const [fileTree, setFileTree] = useState<FileSystem>();
  const [createType, setCreateType] = useState<CreateType>();

  function onCreate(data: { name: string; path?: string; type: CreateType }) {
    setFileTree((fileTree) => {
      if (!fileTree) fileTree = {};

      if (data.path === undefined) {
        if (data.type === "file") {
          fileTree[data.name] = {
            name: data.name,
            isFile: true,
          };
        }
        if (data.type === "folder") {
          fileTree[data.name] = {
            name: data.name,
            files: {},
            isDirectory: true,
          };
        }
      } else {
        const paths = data.path.split("/").filter((path) => path);
        let tempTree = fileTree;

        for (let index = 0; index < paths.length; ++index) {
          const path = paths[index];

          if (tempTree[path] && tempTree[path].isDirectory) {
            const files = tempTree[path].files;
            if (files) {
              tempTree = files;
              const isLastPath = index === paths.length - 1;

              if (isLastPath) {
                if (data.type === "file") {
                  tempTree[data.name] = {
                    name: data.name,
                    isFile: true,
                  };
                }
                if (data.type === "folder") {
                  tempTree[data.name] = {
                    name: data.name,
                    isDirectory: true,
                    files: {},
                  };
                }
              }
            }
          }
        }
      }

      return fileTree;
    });
    setCreateType(undefined);

    // select the current created folder
    const selectedPath =
      data.type === "folder"
        ? data.path
          ? `${data.path}/${data.name}`
          : data.name
        : data.path;

    setSelectedPath(selectedPath);
  }

  return (
    <FileTreeContext.Provider
      value={{
        setSelectedPath,
        onCreate,
        fileTree,
        selectedPath,
        createType,
        setCreateType,
      }}
    >
      {children}
    </FileTreeContext.Provider>
  );
}

export function useFileTree() {
  const fileTree = useContext(FileTreeContext);

  if (fileTree === undefined) {
    throw new Error("useFileTree must be used under FileTreeContext");
  }

  return fileTree;
}
