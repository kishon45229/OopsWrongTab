/**
 * Utility class for domain validation and normalization.
 */
export class DomainUtil {
  /**
   * Returns true if the domain string is a valid.
   * @param {string} domain
   * @returns {boolean}
   */
  static isValidDomainFormat(domain) {
    const domainRegex =
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i;
    return domainRegex.test(domain);
  }

  /**
   * Removes protocol, www, trailing slash, lowercases.
   * @param {string} domain
   * @returns {string}
   */
  static cleanDomain(domain) {
    return domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "")
      .toLowerCase();
  }

  /**
   * Validates a domain string.
   * @param {string} domain
   * @param {Array<string>} blockedDomains
   * @returns {{isValid: boolean, message: string}}
   */
  static validate(domain, blockedDomains = []) {
    const clean = DomainUtil.cleanDomain(domain);
    const blocked = (blockedDomains || []).map((d) => d.toLowerCase());

    if (blocked.includes(clean)) {
      return {
        isValid: false,
        message: "Domain already blocked",
      };
    }

    if (clean.includes(" ")) {
      return {
        isValid: false,
        message: "Domain names cannot contain spaces",
      };
    }

    if (clean.startsWith("-") || clean.endsWith("-")) {
      return {
        isValid: false,
        message: "Domain names cannot start or end with hyphens",
      };
    }

    if (clean.includes("..")) {
      return {
        isValid: false,
        message: "Domain names cannot contain consecutive dots",
      };
    }

    if (clean.length < 3) {
      return {
        isValid: false,
        message: "Domain name too short (minimum 3 characters)",
      };
    }

    if (clean.length > 253) {
      return {
        isValid: false,
        message: "Domain name too long (maximum 253 characters)",
      };
    }

    if (!DomainUtil.isValidDomainFormat(clean)) {
      if (!clean.includes(".")) {
        return {
          isValid: false,
          message: "Domain must include a top-level domain (e.g., .com, .org)",
        };
      }

      if (clean.startsWith(".") || clean.endsWith(".")) {
        return {
          isValid: false,
          message: "Domain cannot start or end with a dot",
        };
      }

      return {
        isValid: false,
        message: "Invalid domain format. Use format like 'example.com'",
      };
    }

    const tld = clean.split(".").pop();
    if (tld.length < 2) {
      return {
        isValid: false,
        message: "Top-level domain must be at least 2 characters",
      };
    }

    return {
      isValid: true,
      message: `✓ Ready to block ${clean}`,
    };
  }
}
