import "@testing-library/jest-dom";

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

(global as any).ResizeObserver = ResizeObserver;

jest.mock("jose", () => ({
  jwtVerify: jest.fn(async () => ({
    payload: { uid: "test-user-id" },
  })),
}));

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterAll(() => {
  (console.warn as jest.Mock).mockRestore();
  expect(true).toBe(true);
});
