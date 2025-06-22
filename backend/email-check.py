#!/usr/bin/env python3
import sys
import json
import re
import asyncio
import nest_asyncio

# Fix the event loop issue
nest_asyncio.apply()

def email_format_validation(email):
    """Basic email format validation using regex"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def comprehensive_email_check(email):
    """Complete email verification with event loop fix"""
    
    # Step 1: Format validation first
    format_valid = email_format_validation(email)
    print(f"DEBUG: Format validation for {email}: {format_valid}", file=sys.stderr)
    
    if not format_valid:
        return {
            "email": email,
            "is_valid": False,
            "reason": "Invalid email format",
            "checks": {
                "format": False,
                "verify_email": None
            }
        }
    
    # Step 2: Use verify_email with event loop fix
    try:
        print(f"DEBUG: Importing verify_email", file=sys.stderr)
        from verify_email import verify_email
        
        print(f"DEBUG: Running verify_email for {email}", file=sys.stderr)
        # This should now work without event loop issues
        verify_result = verify_email(email, debug=True)
        print(f"DEBUG: verify_email returned: {verify_result} (type: {type(verify_result)})", file=sys.stderr)
        
        return {
            "email": email,
            "is_valid": bool(verify_result),
            "reason": "Email verified successfully" if verify_result else "Email does not exist",
            "checks": {
                "format": True,
                "verify_email": bool(verify_result)
            }
        }
        
    except Exception as e:
        print(f"DEBUG: Exception during verification - {str(e)}", file=sys.stderr)
        return {
            "email": email,
            "is_valid": False,
            "reason": f"Verification failed: {str(e)}",
            "checks": {
                "format": True,
                "verify_email": False,
                "error": str(e)
            }
        }

if __name__ == "__main__":
    print(f"DEBUG: Script started with args: {sys.argv}", file=sys.stderr)
    
    if len(sys.argv) < 2:
        result = {"success": False, "error": "Email argument required"}
        print(json.dumps(result))
        sys.exit(1)
    
    email = sys.argv[1]
    print(f"DEBUG: Processing email: {email}", file=sys.stderr)
    
    result = comprehensive_email_check(email)
    print(f"DEBUG: Final result: {result}", file=sys.stderr)
    
    print(json.dumps(result))
