@echo off
:TOP

xcopy /y "D:\OneDrive - Adobe Systems Inc\DRIVE D\workspace\StockInfo\changes.json" C:\Users\anurkuma\Dropbox\sync_stockInfo
xcopy /y "D:\OneDrive - Adobe Systems Inc\DRIVE D\workspace\StockInfo\positions.json" C:\Users\anurkuma\Dropbox\sync_stockInfo

timeout 10
goto :TOP