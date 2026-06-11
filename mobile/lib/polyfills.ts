// Polyfills for Node.js < 18 compatibility
// This file should be imported at the very start of the app

// ReadableStream polyfill for Supabase client
if (typeof globalThis.ReadableStream === "undefined") {
  try {
    const { ReadableStream } = require("web-streams-polyfill/ponyfill");
    globalThis.ReadableStream = ReadableStream;
  } catch {
    // Polyfill not installed, will work on Node 18+
  }
}

// TextEncoder/TextDecoder polyfill (usually available but just in case)
if (typeof globalThis.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}

export {};
