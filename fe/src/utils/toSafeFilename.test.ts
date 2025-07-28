import { toSafeFilename } from "./toSafeFilename";

describe("toSafeFilename", () => {
  it("should handle normal strings", () => {
    expect(toSafeFilename("hello world")).toBe("hello_world");
    expect(toSafeFilename("my document")).toBe("my_document");
  });

  it("should replace unsafe characters with underscores", () => {
    expect(toSafeFilename("file<name>")).toBe("file_name");
    expect(toSafeFilename('file"name')).toBe("file_name");
    expect(toSafeFilename("file/path\\name")).toBe("file_path_name");
    expect(toSafeFilename("file:name|test")).toBe("file_name_test");
    expect(toSafeFilename("file?name*test")).toBe("file_name_test");
  });

  it("should replace multiple spaces with single underscore", () => {
    expect(toSafeFilename("hello   world")).toBe("hello_world");
    expect(toSafeFilename("a    b    c")).toBe("a_b_c");
  });

  it("should replace multiple consecutive underscores with single underscore", () => {
    expect(toSafeFilename("file___name")).toBe("file_name");
    expect(toSafeFilename("a____b")).toBe("a_b");
  });

  it("should trim leading and trailing underscores", () => {
    expect(toSafeFilename("_filename_")).toBe("filename");
    expect(toSafeFilename("___test___")).toBe("test");
  });

  it("should truncate long filenames", () => {
    const longString = "a".repeat(300);
    const result = toSafeFilename(longString);
    expect(result.length).toBe(255);
    expect(result).toBe("a".repeat(255));
  });

  it("should return 'untitled' for empty or invalid input", () => {
    expect(toSafeFilename("")).toBe("untitled");
    expect(toSafeFilename("   ")).toBe("untitled");
    expect(toSafeFilename("___")).toBe("untitled");
    expect(toSafeFilename("<>:/\\|?*")).toBe("untitled");
  });

  it("should handle complex mixed cases", () => {
    expect(toSafeFilename("My Document: Version 2.0 (Final)")).toBe(
      "My_Document_Version_2.0_(Final)",
    );
    expect(toSafeFilename("Project/Report - 2024\\Final.pdf")).toBe(
      "Project_Report_-_2024_Final.pdf",
    );
  });
});
