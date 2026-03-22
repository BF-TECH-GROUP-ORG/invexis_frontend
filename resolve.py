import re
import sys

path = r"src\components\layouts\SideBar.jsx"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

def replacer(match):
    head = match.group(1).strip()
    theirs = match.group(2).strip()
    
    # 1. Block 1, 3, 4 (our tourId, theirs is empty)
    if "tourId" in head and not theirs:
        return match.group(1) + "\n"
    
    # 2. Block 2: sidebar.transactions with vs without comma
    if "sidebar.transactions" in head and "sidebar.transactions" in theirs:
        return match.group(1) + "\n"
        
    # 3. Block 5: sidebar-toggle-btn in theirs
    if "sidebar-toggle-btn" in theirs:
        return match.group(2) + "\n"
        
    # 4. Block 6: prefetchData logic
    if "navItems.slice(0, 3)" in head and "navItems.slice(0, 3)" in theirs:
        return match.group(2) + "\n"
        
    print("UNKNOWN CONFLICT:")
    print("HEAD:\n", head)
    print("THEIRS:\n", theirs)
    return match.group(0)

new_text = re.sub(r"<<<<<<< HEAD\r?\n(.*?)\r?\n=======\r?\n(.*?)>>>>>>> 047c0ab946eb2b9f2a784ff156ac0f4ed56fe6e9\r?\n?", replacer, text, flags=re.DOTALL)

with open(path, "w", encoding="utf-8") as f:
    f.write(new_text)

print("Conflicts resolved successfully.")
