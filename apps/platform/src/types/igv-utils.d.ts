declare module 'igv-utils' {
    // String Utilities
    namespace StringUtils {
        // Define string utility functions as needed
    }

    // File Utilities
    namespace FileUtils {
        // Define file utility functions as needed
    }

    // URI Utilities
    namespace URIUtils {
        // Define URI utility functions as needed
    }

    // BGZip functionality
    namespace BGZip {
        function unbgzf(data: ArrayBuffer | Uint8Array, lim?: number): Uint8Array;
        function bgzBlockSize(data: ArrayBuffer | Uint8Array): number;
        function gzip(data: any): Uint8Array;
        function ungzip(data: ArrayBuffer | Uint8Array): Uint8Array;
        function isgzipped(data: ArrayBuffer | Uint8Array): boolean;
        function compressString(str: string): string;
        function uncompressString(enc: string): string;
        function decodeDataURI(dataURI: string, gzip?: boolean): Uint8Array | string;
        function inflate(data: any): Uint8Array;
        function inflateRaw(data: any): Uint8Array;
    }

    // IGV Color
    class IGVColor {
        // Define IGVColor methods and properties as needed
    }

    // IGV Math
    class IGVMath {
        // Define IGVMath methods and properties as needed
    }

    // igvxhr
    const igvxhr: {
        // Define igvxhr methods and properties as needed
    };

    // Feature Cache
    class FeatureCache {
        // Define FeatureCache methods and properties as needed
    }

    // Feature Utils
    const FeatureUtils: {
        // Define FeatureUtils methods and properties as needed
    };

    // Google Utilities
    namespace GoogleUtils {
        // Define Google utility functions as needed
    }

    namespace GoogleAuth {
        // Define Google authentication functions as needed
    }

    namespace GoogleDrive {
        // Define Google Drive functions as needed
    }

    namespace GooglePicker {
        // Define Google Picker functions as needed
    }

    export {
        IGVColor,
        IGVMath,
        StringUtils,
        FileUtils,
        URIUtils,
        BGZip,
        igvxhr,
        FeatureCache,
        FeatureUtils,
        GoogleUtils,
        GoogleAuth,
        GoogleDrive,
        GooglePicker
    };
} 