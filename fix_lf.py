import os

def to_lf(path):
    if not os.path.exists(path):
        return
    with open(path, 'rb') as f:
        content = f.read()
    with open(path, 'wb') as f:
        f.write(content.replace(b'\r\n', b'\n'))

files = [
    'Clarinet.toml',
    'contracts/trustwork-marketplace.clar',
    'contracts/usdcx.clar'
]

for f in files:
    to_lf(f)
    print(f"Converted {f}")
