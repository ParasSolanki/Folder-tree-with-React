import {
  ChevronDown,
  ChevronRight,
  FilePlus as FilePlusIcon,
  MoonIcon,
  SunIcon,
  FolderPlusIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Input } from "~/components/ui/input";
import {
  Directory,
  File,
  FileTreeProvider,
  useFileTree,
} from "./FileTreeContext";
import { Button } from "./components/ui/button";
import {
  FileTypeJsOfficialIcon,
  DefaultFile,
  DefaultFolderIcon,
  DefaultFolderOpenedIcon,
  FileTypeJsonOfficialIcon,
  FileTypeReactJsxOfficialIcon,
  FileTypeReactTsxOfficialIcon,
  FileTypeTextOfficialIcon,
  FileTypeTsOfficialIcon,
  FileTypeHtmlIcon,
} from "./components/file-icons";
import { ScrollArea } from "./components/ui/scroll-area";

function FileIcon({ ext }: { ext?: string }) {
  if (ext === "html") {
    return <FileTypeHtmlIcon className="mr-1.5 size-5 shrink-0" />;
  } else if (ext === "ts") {
    return <FileTypeTsOfficialIcon className="mr-1.5 size-5 shrink-0" />;
  } else if (ext === "json") {
    return <FileTypeJsonOfficialIcon className="mr-1.5 size-5 shrink-0" />;
  } else if (ext === "jsx") {
    return <FileTypeReactJsxOfficialIcon className="mr-1.5 size-5 shrink-0" />;
  } else if (ext === "tsx") {
    return <FileTypeReactTsxOfficialIcon className="mr-1.5 size-5 shrink-0" />;
  } else if (ext === "txt") {
    return <FileTypeTextOfficialIcon className="mr-1.5 size-5 shrink-0" />;
  } else if (ext === "js" || ext === "cjs" || ext === "mjs") {
    return <FileTypeJsOfficialIcon className="mr-1.5 size-5 shrink-0" />;
  }

  return <DefaultFile className="mr-1.5 size-5 shrink-0" />;
}

function AddFileForm({ path, depth }: { path?: string; depth: number }) {
  const { createType, onCreate } = useFileTree();

  const formDepth = createType === "file" ? depth + 22 : depth;

  return (
    <form
      style={{ paddingLeft: `${formDepth}px` }}
      onSubmit={(e) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const name = formData.get("name") as string | null;

        if (!name || !createType) return;

        onCreate({
          name,
          path,
          type: createType,
        });
      }}
    >
      <div className="inline-flex items-center justify-center py-1">
        {createType === "file" && (
          <DefaultFile className="mr-1.5 size-5 shrink-0" />
        )}

        {createType === "folder" && (
          <>
            <ChevronRight className="mr-1 size-5 shrink-0" />
            <DefaultFolderIcon className="mr-1 size-5 shrink-0" />
          </>
        )}

        <Input
          name="name"
          type="text"
          autoFocus
          className="h-6 bg-primary px-1 text-base"
        />
      </div>
    </form>
  );
}

const Folder = ({
  dir,
  path,
  depth,
}: {
  dir: Directory;
  path: string;
  depth: number;
}) => {
  const [open, setOpen] = useState(false);
  const { setSelectedPath, selectedPath, createType } = useFileTree();

  const childDepth = depth + 22;

  useEffect(() => {
    if (path === selectedPath && createType && !open) {
      setOpen(true);
    }
  }, [path, selectedPath, createType, open]);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="text-left"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        setSelectedPath(path);
      }}
    >
      <CollapsibleTrigger
        style={{ paddingLeft: `${depth}px` }}
        data-selected={path === selectedPath}
        className="inline-flex items-center hover:bg-primary-foreground/30 py-1 w-full data-[selected='true']:bg-primary-foreground/30 data-[selected='true']:font-semibold "
      >
        {!open && (
          <>
            <ChevronRight className="mr-1 size-5 shrink-0" />
            <DefaultFolderIcon className="mr-1 size-5 shrink-0" />
          </>
        )}
        {open && (
          <>
            <ChevronDown className="mr-1 size-5 shrink-0" />
            <DefaultFolderOpenedIcon className="mr-1 size-5 shrink-0" />
          </>
        )}
        <span className="truncate">{dir?.name}</span>
      </CollapsibleTrigger>

      <CollapsibleContent>
        {path === selectedPath && createType && (
          <AddFileForm path={path} depth={childDepth} />
        )}
        {dir?.files &&
          Object.keys(dir.files).map((filePath) => (
            <div key={filePath}>
              {dir.files[filePath].isFile && (
                // @ts-expect-error The expected type comes from property 'file'
                <TextFile depth={childDepth} file={dir.files[filePath]} />
              )}
              {dir.files[filePath].isDirectory && (
                <Folder
                  depth={childDepth}
                  // @ts-expect-error The expected type comes from property 'dir'
                  dir={dir.files[filePath]}
                  path={`${path}/${filePath}`}
                />
              )}
            </div>
          ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

function TextFile({ file, depth }: { file: File; depth: number }) {
  const fileDepth = depth + 22;

  const ext = file.name.split(".").pop();

  return (
    <div
      className="inline-flex items-center py-1 hover:bg-primary-foreground/30 w-full text-primary-foreground"
      style={{ paddingLeft: `${fileDepth}px` }}
    >
      <FileIcon ext={ext} />

      <span className="truncate">{file.name}</span>
    </div>
  );
}

function FileTree() {
  const { fileTree, setCreateType, selectedPath, createType, setSelectedPath } =
    useFileTree();

  useEffect(() => {
    function clearCreateType() {
      setCreateType(undefined);
    }

    document.addEventListener("mousedown", clearCreateType);

    return () => {
      document.removeEventListener("mousedown", clearCreateType);
    };
  }, [setCreateType]);

  return (
    <>
      <div className="flex justify-between bg-primary-foreground items-center px-2">
        <span className="text-primary text-base font-bold uppercase grow">
          Root
        </span>
        <div className="space-x-3 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary"
            onClick={() => setCreateType("file")}
          >
            <FilePlusIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary"
            onClick={() => setCreateType("folder")}
          >
            <FolderPlusIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <ScrollArea
        className="h-[500px] "
        onClick={() => setSelectedPath(undefined)}
      >
        {!selectedPath && createType && <AddFileForm depth={0} />}
        {fileTree &&
          Object.keys(fileTree).map((path) => (
            <div key={path}>
              {fileTree[path].isFile && (
                // @ts-expect-error The expected type comes from property 'file'
                <TextFile depth={0} file={fileTree[path]} />
              )}
              {fileTree[path].isDirectory && (
                // @ts-expect-error The expected type comes from property 'dir'
                <Folder dir={fileTree[path]} path={path} depth={0} />
              )}
            </div>
          ))}
      </ScrollArea>
    </>
  );
}

type ColorMode = "light" | "dark";

function App() {
  const [colorMode, setColorMode] = useState<ColorMode>("dark");

  function changeColorMode(colorMode: ColorMode) {
    document.documentElement.classList.add("no-transitions");
    document.documentElement.classList.remove("light", "dark");

    setColorMode(colorMode);
    document.documentElement.classList.add(
      colorMode === "dark" ? "light" : "dark"
    );

    setTimeout(() => {
      document.documentElement.classList.remove("no-transitions");
    });
  }

  return (
    <main className="max-w-2xl mx-auto p-4 h-screen flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground">
          File Tree with React
        </h1>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={() =>
            changeColorMode(colorMode === "dark" ? "light" : "dark")
          }
        >
          {colorMode === "light" && <MoonIcon className="size-5" />}
          {colorMode === "dark" && <SunIcon className="size-5" />}
        </Button>
      </div>

      <div className="mt-4 text-primary-foreground grow flex flex-col">
        <FileTreeProvider>
          <FileTree />
        </FileTreeProvider>
      </div>
    </main>
  );
}

export default App;
