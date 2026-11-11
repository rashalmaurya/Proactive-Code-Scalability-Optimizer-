items = [1, 2, 3, 4, 5]

for i in range(len(items)):
    for j in range(len(items)):
        if i in items:
            print(i, j)
