param(
    [string]$OutDir = (Join-Path $PSScriptRoot "exports-v2")
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$Script:CanvasW = 1440
$Script:CanvasH = 1024

$Script:Palette = @{
    Bg = "#F7F9FB"
    Panel = "#FFFFFF"
    Ink = "#20242A"
    Muted = "#6F7782"
    SoftText = "#9AA3AE"
    Line = "#E4E9EF"
    LineSoft = "#F0F3F7"
    Sidebar = "#FFFFFF"
    SidebarLift = "#FFF5E9"
    Coral = "#FF9F2E"
    CoralSoft = "#FFF1DE"
    Teal = "#12B9D6"
    TealSoft = "#E7F9FC"
    Green = "#20B978"
    GreenSoft = "#E7F8F0"
    Blue = "#192B55"
    BlueSoft = "#E9EEF8"
    Amber = "#FF9F2E"
    AmberSoft = "#FFF1DE"
    Red = "#F04444"
    RedSoft = "#FEEBEB"
    Purple = "#3E12B8"
    PurpleSoft = "#EFE9FF"
    Slate = "#647586"
    SlateSoft = "#EEF3F7"
}

function Convert-UiColor {
    param([object]$Color)

    if ($Color -is [System.Drawing.Color]) {
        return $Color
    }

    return [System.Drawing.ColorTranslator]::FromHtml([string]$Color)
}

function New-UiFont {
    param(
        [float]$Size,
        [string]$Weight = "Regular"
    )

    $fontStyle = [System.Drawing.FontStyle]::Regular
    if ($Weight -eq "Bold") {
        $fontStyle = [System.Drawing.FontStyle]::Bold
    }
    elseif ($Weight -eq "Italic") {
        $fontStyle = [System.Drawing.FontStyle]::Italic
    }

    return [System.Drawing.Font]::new("Segoe UI", $Size, $fontStyle, [System.Drawing.GraphicsUnit]::Pixel)
}

function New-SolidBrush {
    param([object]$Color)
    return [System.Drawing.SolidBrush]::new((Convert-UiColor $Color))
}

function New-UiPen {
    param(
        [object]$Color,
        [float]$Width = 1
    )
    return [System.Drawing.Pen]::new((Convert-UiColor $Color), $Width)
}

function New-AlphaColor {
    param(
        [string]$Hex,
        [int]$Alpha
    )

    $base = Convert-UiColor $Hex
    return [System.Drawing.Color]::FromArgb($Alpha, $base.R, $base.G, $base.B)
}

function New-RoundRectPath {
    param(
        [float]$X,
        [float]$Y,
        [float]$W,
        [float]$H,
        [float]$R
    )

    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $d = $R * 2
    $path.AddArc($X, $Y, $d, $d, 180, 90)
    $path.AddArc($X + $W - $d, $Y, $d, $d, 270, 90)
    $path.AddArc($X + $W - $d, $Y + $H - $d, $d, $d, 0, 90)
    $path.AddArc($X, $Y + $H - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

function Fill-RoundRect {
    param(
        [System.Drawing.Graphics]$G,
        [float]$X,
        [float]$Y,
        [float]$W,
        [float]$H,
        [float]$R,
        [object]$Color
    )

    $path = New-RoundRectPath $X $Y $W $H $R
    $brush = New-SolidBrush $Color
    $G.FillPath($brush, $path)
    $brush.Dispose()
    $path.Dispose()
}

function Stroke-RoundRect {
    param(
        [System.Drawing.Graphics]$G,
        [float]$X,
        [float]$Y,
        [float]$W,
        [float]$H,
        [float]$R,
        [object]$Color,
        [float]$Width = 1
    )

    $path = New-RoundRectPath $X $Y $W $H $R
    $pen = New-UiPen $Color $Width
    $G.DrawPath($pen, $path)
    $pen.Dispose()
    $path.Dispose()
}

function Draw-Text {
    param(
        [System.Drawing.Graphics]$G,
        [string]$Text,
        [float]$X,
        [float]$Y,
        [float]$W,
        [float]$H,
        [float]$Size = 16,
        [object]$Color = $Script:Palette.Ink,
        [string]$Weight = "Regular",
        [string]$Align = "Near",
        [string]$VAlign = "Near",
        [switch]$Wrap
    )

    $font = New-UiFont $Size $Weight
    $brush = New-SolidBrush $Color
    $format = [System.Drawing.StringFormat]::new()
    $format.Trimming = [System.Drawing.StringTrimming]::EllipsisCharacter

    if (-not $Wrap) {
        $format.FormatFlags = [System.Drawing.StringFormatFlags]::NoWrap
    }

    switch ($Align) {
        "Center" { $format.Alignment = [System.Drawing.StringAlignment]::Center }
        "Far" { $format.Alignment = [System.Drawing.StringAlignment]::Far }
        default { $format.Alignment = [System.Drawing.StringAlignment]::Near }
    }

    switch ($VAlign) {
        "Center" { $format.LineAlignment = [System.Drawing.StringAlignment]::Center }
        "Far" { $format.LineAlignment = [System.Drawing.StringAlignment]::Far }
        default { $format.LineAlignment = [System.Drawing.StringAlignment]::Near }
    }

    $rect = [System.Drawing.RectangleF]::new($X, $Y, $W, $H)
    $G.DrawString($Text, $font, $brush, $rect, $format)

    $format.Dispose()
    $brush.Dispose()
    $font.Dispose()
}

function Draw-Line {
    param(
        [System.Drawing.Graphics]$G,
        [float]$X1,
        [float]$Y1,
        [float]$X2,
        [float]$Y2,
        [object]$Color = $Script:Palette.Line,
        [float]$Width = 1
    )

    $pen = New-UiPen $Color $Width
    $G.DrawLine($pen, $X1, $Y1, $X2, $Y2)
    $pen.Dispose()
}

function Draw-Card {
    param(
        [System.Drawing.Graphics]$G,
        [float]$X,
        [float]$Y,
        [float]$W,
        [float]$H,
        [float]$R = 8
    )

    Fill-RoundRect $G ($X + 2) ($Y + 4) $W $H $R (New-AlphaColor "#1E2630" 16)
    Fill-RoundRect $G $X $Y $W $H $R $Script:Palette.Panel
    Stroke-RoundRect $G $X $Y $W $H $R $Script:Palette.LineSoft
}

function Draw-Chip {
    param(
        [System.Drawing.Graphics]$G,
        [string]$Text,
        [float]$X,
        [float]$Y,
        [float]$W,
        [object]$Bg,
        [object]$Fg,
        [float]$H = 28
    )

    Fill-RoundRect $G $X $Y $W $H 14 $Bg
    Draw-Text $G $Text $X ($Y + 1) $W $H 13 $Fg "Bold" "Center" "Center"
}

function Draw-Button {
    param(
        [System.Drawing.Graphics]$G,
        [string]$Text,
        [float]$X,
        [float]$Y,
        [float]$W,
        [float]$H = 44,
        [string]$Kind = "Primary"
    )

    $bg = $Script:Palette.Coral
    $fg = "#FFFFFF"
    $border = $Script:Palette.Coral

    if ($Kind -eq "Secondary") {
        $bg = "#FFFFFF"
        $fg = $Script:Palette.Ink
        $border = $Script:Palette.Line
    }
    elseif ($Kind -eq "Ghost") {
        $bg = $Script:Palette.LineSoft
        $fg = $Script:Palette.Ink
        $border = $Script:Palette.LineSoft
    }
    elseif ($Kind -eq "Danger") {
        $bg = $Script:Palette.Red
        $fg = "#FFFFFF"
        $border = $Script:Palette.Red
    }
    elseif ($Kind -eq "Slate") {
        $bg = $Script:Palette.Slate
        $fg = "#FFFFFF"
        $border = $Script:Palette.Slate
    }

    Fill-RoundRect $G $X $Y $W $H 8 $bg
    Stroke-RoundRect $G $X $Y $W $H 8 $border
    Draw-Text $G $Text $X ($Y + 1) $W $H 15 $fg "Bold" "Center" "Center"
}

function Draw-Input {
    param(
        [System.Drawing.Graphics]$G,
        [string]$Label,
        [string]$Value,
        [float]$X,
        [float]$Y,
        [float]$W,
        [float]$H = 52,
        [switch]$Muted,
        [string]$ErrorText = "",
        [string]$Leading = ""
    )

    if ($Label.Length -gt 0) {
        Draw-Text $G $Label $X $Y $W 20 13 $Script:Palette.Muted "Bold"
    }

    $boxY = $Y + 24
    Fill-RoundRect $G $X $boxY $W $H 8 "#FFFFFF"
    Stroke-RoundRect $G $X $boxY $W $H 8 $Script:Palette.Line

    $textX = $X + 16
    if ($Leading.Length -gt 0) {
        Draw-Text $G $Leading ($X + 14) $boxY 28 $H 15 $Script:Palette.SoftText "Bold" "Near" "Center"
        $textX = $X + 42
    }

    $textColor = $Script:Palette.Ink
    if ($Muted) {
        $textColor = $Script:Palette.SoftText
    }

    Draw-Text $G $Value $textX $boxY ($W - ($textX - $X) - 14) $H 15 $textColor "Regular" "Near" "Center"

    if ($ErrorText.Length -gt 0) {
        Draw-Text $G $ErrorText $X ($boxY + $H + 6) $W 18 12 $Script:Palette.Red "Bold"
    }
}

function Draw-SearchBar {
    param(
        [System.Drawing.Graphics]$G,
        [string]$Placeholder,
        [float]$X,
        [float]$Y,
        [float]$W
    )

    Fill-RoundRect $G $X $Y $W 44 7 "#FFFFFF"
    Stroke-RoundRect $G $X $Y $W 44 8 $Script:Palette.Line
    Draw-Text $G "Search" ($X + 16) ($Y + 1) 52 44 14 $Script:Palette.SoftText "Bold" "Near" "Center"
    Draw-Text $G $Placeholder ($X + 76) ($Y + 1) ($W - 92) 44 14 $Script:Palette.Muted "Regular" "Near" "Center"
}

function Draw-Toolbar {
    param(
        [System.Drawing.Graphics]$G,
        [string]$Search,
        [float]$X,
        [float]$Y,
        [float]$W,
        [string]$PrimaryText = ""
    )

    Fill-RoundRect $G $X $Y 44 44 7 $Script:Palette.Coral
    Draw-Text $G "F" $X ($Y + 1) 44 44 16 "#FFFFFF" "Bold" "Center" "Center"
    Draw-SearchBar $G $Search ($X + 58) $Y 336
    Draw-Button $G "Sort" ($X + 410) $Y 84 44 "Secondary"
    Draw-Button $G "Columns" ($X + 506) $Y 108 44 "Secondary"

    if ($PrimaryText.Length -gt 0) {
        Draw-Button $G $PrimaryText ($X + $W - 148) $Y 148 44 "Primary"
    }
}

function Draw-Pagination {
    param(
        [System.Drawing.Graphics]$G,
        [float]$X,
        [float]$Y,
        [float]$W,
        [string]$Label = "Showing 1-8 of 48"
    )

    Draw-Text $G $Label $X $Y 240 36 13 $Script:Palette.Muted "Regular" "Near" "Center"
    Draw-Button $G "Prev" ($X + $W - 188) $Y 80 36 "Secondary"
    Draw-Button $G "Next" ($X + $W - 96) $Y 80 36 "Ghost"
}

function Draw-Table {
    param(
        [System.Drawing.Graphics]$G,
        [float]$X,
        [float]$Y,
        [float]$W,
        [array]$Columns,
        [array]$Rows,
        [float]$RowH = 58,
        [float]$HeaderH = 42
    )

    $tableH = $HeaderH + ($Rows.Count * $RowH)
    Fill-RoundRect $G $X $Y $W $tableH 8 "#FFFFFF"
    Stroke-RoundRect $G $X $Y $W $tableH 8 $Script:Palette.LineSoft
    Fill-RoundRect $G $X $Y $W $HeaderH 8 "#F9FAFC"
    Draw-Line $G $X ($Y + $HeaderH) ($X + $W) ($Y + $HeaderH) $Script:Palette.Line

    $cx = $X
    foreach ($col in $Columns) {
        Draw-Text $G $col.Label ($cx + 14) ($Y + 1) ($col.W - 22) $HeaderH 12 $Script:Palette.Muted "Bold" "Near" "Center"
        $cx += $col.W
    }

    for ($i = 0; $i -lt $Rows.Count; $i++) {
        $rowY = $Y + $HeaderH + ($i * $RowH)
        if ($i % 2 -eq 1) {
            $brush = New-SolidBrush "#FCFDFF"
            $G.FillRectangle($brush, [System.Drawing.RectangleF]::new($X, $rowY, $W, $RowH))
            $brush.Dispose()
        }

        Draw-Line $G $X ($rowY + $RowH) ($X + $W) ($rowY + $RowH) $Script:Palette.LineSoft

        $cx = $X
        for ($j = 0; $j -lt $Columns.Count; $j++) {
            $cell = [string]$Rows[$i][$j]
            $col = $Columns[$j]
            $color = $Script:Palette.Ink
            $weight = "Regular"

            if ($cell.StartsWith("!red!")) {
                $cell = $cell.Substring(5)
                $color = $Script:Palette.Red
                $weight = "Bold"
            }
            elseif ($cell.StartsWith("!muted!")) {
                $cell = $cell.Substring(7)
                $color = $Script:Palette.Muted
            }
            elseif ($cell.StartsWith("!bold!")) {
                $cell = $cell.Substring(6)
                $weight = "Bold"
            }

            if ($cell.StartsWith("!chip-green!")) {
                $cell = $cell.Substring(12)
                Draw-Chip $G $cell ($cx + 14) ($rowY + 15) 78 $Script:Palette.GreenSoft $Script:Palette.Green
            }
            elseif ($cell.StartsWith("!chip-red!")) {
                $cell = $cell.Substring(10)
                Draw-Chip $G $cell ($cx + 14) ($rowY + 15) 78 $Script:Palette.RedSoft $Script:Palette.Red
            }
            elseif ($cell.StartsWith("!product!")) {
                $cell = $cell.Substring(9)
                Fill-RoundRect $G ($cx + 14) ($rowY + 11) 36 36 8 $Script:Palette.CoralSoft
                Stroke-RoundRect $G ($cx + 14) ($rowY + 11) 36 36 8 "#F5CDC6"
                Draw-Text $G $cell ($cx + 60) ($rowY + 1) ($col.W - 72) $RowH 14 $Script:Palette.Ink "Bold" "Near" "Center"
            }
            elseif ($cell.StartsWith("!actions!")) {
                Draw-Button $G "View" ($cx + 14) ($rowY + 13) 56 32 "Secondary"
                Draw-Button $G "Edit" ($cx + 78) ($rowY + 13) 54 32 "Ghost"
            }
            elseif ($cell.StartsWith("!remove!")) {
                Draw-Button $G "Remove" ($cx + 6) ($rowY + 13) 78 32 "Secondary"
            }
            else {
                Draw-Text $G $cell ($cx + 14) ($rowY + 1) ($col.W - 22) $RowH 14 $color $weight "Near" "Center"
            }

            $cx += $col.W
        }
    }
}

function Draw-Shell {
    param(
        [System.Drawing.Graphics]$G,
        [string]$Active,
        [string]$Title,
        [string]$Subtitle
    )

    $bgBrush = New-SolidBrush $Script:Palette.Bg
    $G.FillRectangle($bgBrush, 0, 0, $Script:CanvasW, $Script:CanvasH)
    $bgBrush.Dispose()

    $sideBrush = New-SolidBrush $Script:Palette.Sidebar
    $G.FillRectangle($sideBrush, 0, 0, 252, $Script:CanvasH)
    $sideBrush.Dispose()
    Draw-Line $G 252 0 252 $Script:CanvasH $Script:Palette.Line

    Fill-RoundRect $G 38 28 48 48 12 $Script:Palette.CoralSoft
    Fill-RoundRect $G 55 35 14 34 7 $Script:Palette.Coral
    Fill-RoundRect $G 66 47 14 22 7 $Script:Palette.Teal
    Draw-Text $G "Kalon POS" 100 28 132 28 21 $Script:Palette.Ink "Bold"
    Draw-Text $G "Beauty retail admin" 102 58 132 22 12 $Script:Palette.Muted

    $productOpen = $Active -eq "Products" -or $Active -eq "Categories"
    $salesOpen = $Active -eq "Sales"

    $nav = @(
        @{ Key = "Dashboard"; Label = "Dashboard"; Mark = "D" },
        @{ Key = "Products"; Label = "Product"; Mark = "P" },
        @{ Key = "Sales"; Label = "Sales"; Mark = "S" },
        @{ Key = "Users"; Label = "Users"; Mark = "U" },
        @{ Key = "Customers"; Label = "Customer"; Mark = "C" }
    )

    $ny = 124
    foreach ($item in $nav) {
        $isOpen = ($item.Key -eq "Products" -and $productOpen) -or ($item.Key -eq "Sales" -and $salesOpen)
        $isActive = $item.Key -eq $Active -or $isOpen

        if ($isActive) {
            Fill-RoundRect $G 22 ($ny - 6) 208 46 8 $Script:Palette.SidebarLift
            Fill-RoundRect $G 36 ($ny + 10) 9 9 5 $Script:Palette.Coral
        }

        $iconBg = "#F1F4F7"
        $iconColor = $Script:Palette.Muted
        $labelColor = $Script:Palette.Muted
        if ($isActive) {
            $iconBg = $Script:Palette.Coral
            $iconColor = "#FFFFFF"
            $labelColor = $Script:Palette.Coral
        }

        Fill-RoundRect $G 50 $ny 28 28 7 $iconBg
        Draw-Text $G $item.Mark 50 $ny 28 28 12 $iconColor "Bold" "Center" "Center"
        Draw-Text $G $item.Label 92 ($ny + 1) 104 28 15 $labelColor "Bold" "Near" "Center"
        if ($item.Key -eq "Products" -or $item.Key -eq "Sales") {
            $chev = ">"
            if ($isOpen) { $chev = "v" }
            Draw-Text $G $chev 204 ($ny + 1) 18 28 16 $Script:Palette.Muted "Bold" "Center" "Center"
        }

        $ny += 52

        if ($item.Key -eq "Products" -and $productOpen) {
            Fill-RoundRect $G 36 ($ny - 4) 188 138 8 "#FAFBFD"
            $sub = @("Product List", "Add Product", "Category List", "Add Category")
            foreach ($s in $sub) {
                $subActive = ($Title -match "Category" -and $s -eq "Category List") -or
                    ($Title -match "Add / Edit Product" -and $s -eq "Add Product") -or
                    (($Title -eq "Products") -and $s -eq "Product List")
                if ($subActive) {
                    Fill-RoundRect $G 48 ($ny + 2) 152 26 6 $Script:Palette.CoralSoft
                    Fill-RoundRect $G 54 ($ny + 12) 8 8 4 $Script:Palette.Coral
                }
                else {
                    Stroke-RoundRect $G 54 ($ny + 12) 8 8 4 $Script:Palette.Line
                }
                $subColor = $Script:Palette.Muted
                if ($subActive) { $subColor = $Script:Palette.Coral }
                Draw-Text $G $s 72 ($ny + 3) 128 24 13 $subColor "Bold" "Near" "Center"
                $ny += 32
            }
            $ny += 12
        }

        if ($item.Key -eq "Sales" -and $salesOpen) {
            Fill-RoundRect $G 36 ($ny - 4) 188 76 8 "#FAFBFD"
            $sub = @("Sales List", "New Sales")
            foreach ($s in $sub) {
                $subActive = (($Title -match "Sales" -or $Title -match "Sale Details" -or $Title -match "Update Sale") -and $s -eq "Sales List") -or
                    ($Title -match "Add New Sale" -and $s -eq "New Sales")
                if ($subActive) {
                    Fill-RoundRect $G 48 ($ny + 2) 152 26 6 $Script:Palette.CoralSoft
                    Fill-RoundRect $G 54 ($ny + 12) 8 8 4 $Script:Palette.Coral
                }
                else {
                    Stroke-RoundRect $G 54 ($ny + 12) 8 8 4 $Script:Palette.Line
                }
                $subColor = $Script:Palette.Muted
                if ($subActive) { $subColor = $Script:Palette.Coral }
                Draw-Text $G $s 72 ($ny + 3) 128 24 13 $subColor "Bold" "Near" "Center"
                $ny += 32
            }
            $ny += 12
        }
    }

    Draw-Line $G 28 842 224 842 $Script:Palette.Line
    Draw-Text $G "Signed in as" 42 864 150 20 12 $Script:Palette.SoftText
    Draw-Text $G "Administrator" 42 888 150 24 15 $Script:Palette.Ink "Bold"
    Draw-Chip $G "Online" 42 920 74 $Script:Palette.GreenSoft $Script:Palette.Green 26

    $topBrush = New-SolidBrush "#FFFFFF"
    $G.FillRectangle($topBrush, 252, 0, $Script:CanvasW - 252, 84)
    $topBrush.Dispose()
    Draw-Line $G 252 84 $Script:CanvasW 84 $Script:Palette.LineSoft

    Draw-SearchBar $G "Products, sales, customers" 292 20 404
    Draw-Button $G "Add Sale" 1044 20 116 44 "Primary"
    Fill-RoundRect $G 1184 18 46 46 23 "#EEF2F5"
    Draw-Text $G "A" 1184 17 46 46 17 $Script:Palette.Muted "Bold" "Center" "Center"
    Fill-RoundRect $G 1218 50 9 9 5 $Script:Palette.Green
    Draw-Text $G "Admin" 1242 19 132 22 14 $Script:Palette.Ink "Bold"
    Draw-Text $G "Owner" 1242 43 132 22 12 $Script:Palette.Muted

    Draw-Text $G $Title 292 112 680 34 26 $Script:Palette.Ink "Bold"
    Draw-Text $G $Subtitle 292 148 720 24 14 $Script:Palette.Muted

    return @{ X = 292; Y = 202; W = 1108; H = 782 }
}

function Draw-StatCard {
    param(
        [System.Drawing.Graphics]$G,
        [string]$Label,
        [string]$Value,
        [string]$Meta,
        [float]$X,
        [float]$Y,
        [float]$W,
        [object]$Accent,
        [object]$Soft
    )

    Fill-RoundRect $G ($X + 2) ($Y + 5) $W 128 8 (New-AlphaColor "#20242A" 18)
    Fill-RoundRect $G $X $Y $W 128 8 $Accent
    Draw-Text $G $Value ($X + 24) ($Y + 28) 120 38 30 "#FFFFFF" "Bold"
    Draw-Text $G $Label ($X + 24) ($Y + 72) 150 24 16 "#FFFFFF" "Bold"
    Draw-Text $G $Meta ($X + 24) ($Y + 98) ($W - 48) 18 12 (New-AlphaColor "#FFFFFF" 210) "Bold"

    $mark = $Label.Substring(0, 1).ToUpper()
    if ($Label -match "Products") { $mark = "P" }
    elseif ($Label -match "Stock") { $mark = "I" }
    elseif ($Label -match "Sales") { $mark = "C" }
    Draw-Text $G $mark ($X + $W - 92) ($Y + 20) 68 80 58 (New-AlphaColor "#FFFFFF" 180) "Bold" "Center" "Center"
}

function Draw-Login {
    param([System.Drawing.Graphics]$G)

    $brush = New-SolidBrush "#101326"
    $G.FillRectangle($brush, 0, 0, $Script:CanvasW, $Script:CanvasH)
    $brush.Dispose()

    $overlay = New-SolidBrush (New-AlphaColor "#3E12B8" 74)
    $G.FillRectangle($overlay, 0, 0, $Script:CanvasW, $Script:CanvasH)
    $overlay.Dispose()

    $productColors = @("#20304F", "#6B2942", "#254A55", "#4E3148", "#14264A", "#593D29")
    for ($i = 0; $i -lt 14; $i++) {
        $px = 52 + (($i % 7) * 190)
        $py = 88 + ([math]::Floor($i / 7) * 410)
        $pw = 104 + (($i % 3) * 22)
        $ph = 258 + (($i % 4) * 18)
        Fill-RoundRect $G $px $py $pw $ph 16 (New-AlphaColor $productColors[$i % $productColors.Count] 130)
        Fill-RoundRect $G ($px + 16) ($py + 28) ($pw - 32) 34 8 (New-AlphaColor "#FFFFFF" 34)
        Fill-RoundRect $G ($px + 20) ($py + 92) ($pw - 40) 96 10 (New-AlphaColor "#FFFFFF" 22)
        Draw-Text $G "BEAUTY" ($px + 16) ($py + 202) ($pw - 32) 24 13 (New-AlphaColor "#FFFFFF" 90) "Bold" "Center"
    }

    $veil = New-SolidBrush (New-AlphaColor "#070817" 156)
    $G.FillRectangle($veil, 0, 0, $Script:CanvasW, $Script:CanvasH)
    $veil.Dispose()

    Draw-Text $G "Kalon POS" 74 72 260 40 32 "#FFFFFF" "Bold"
    Draw-Text $G "Beauty retail administration" 76 116 270 24 15 "#CAC8E8"

    Draw-Card $G 500 188 440 596
    Draw-Text $G "Sign in" 548 238 344 42 30 $Script:Palette.Purple "Bold" "Center"
    Fill-RoundRect $G 686 286 68 5 3 $Script:Palette.Purple
    Draw-Input $G "" "administrator" 548 346 344 52 -Leading "U"
    Draw-Input $G "" "********" 548 430 344 52 -Leading "L"
    Draw-Text $G "Lost Password?  Click Here" 548 510 344 24 14 $Script:Palette.Ink "Regular" "Center" "Center"
    Fill-RoundRect $G 548 610 344 50 25 $Script:Palette.Purple
    Draw-Text $G "Sign in" 548 611 344 50 16 "#FFFFFF" "Bold" "Center" "Center"

    Fill-RoundRect $G 548 694 344 54 8 $Script:Palette.RedSoft
    Draw-Text $G "Invalid credentials" 568 704 304 18 13 $Script:Palette.Red "Bold" "Center"
    Draw-Text $G "Try administrator / password again." 568 726 304 18 12 $Script:Palette.Red "Regular" "Center"
}

function Draw-Loading {
    param([System.Drawing.Graphics]$G)

    $brush = New-SolidBrush "#FFFFFF"
    $G.FillRectangle($brush, 0, 0, $Script:CanvasW, $Script:CanvasH)
    $brush.Dispose()

    $pen = New-UiPen $Script:Palette.Coral 18
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $G.DrawArc($pen, 665, 418, 110, 110, 35, 286)
    $pen.Dispose()

    Draw-Text $G "Loading dashboard" 560 558 320 28 18 $Script:Palette.Ink "Bold" "Center"
    Draw-Text $G "Preparing products, sales, and stock counts." 520 594 400 24 14 $Script:Palette.Muted "Regular" "Center"
}

function Draw-ForgotPassword {
    param([System.Drawing.Graphics]$G)

    $brush = New-SolidBrush $Script:Palette.Bg
    $G.FillRectangle($brush, 0, 0, $Script:CanvasW, $Script:CanvasH)
    $brush.Dispose()

    Draw-Card $G 464 176 512 590
    Fill-RoundRect $G 692 224 56 56 14 $Script:Palette.CoralSoft
    Draw-Text $G "K" 692 223 56 56 26 $Script:Palette.Coral "Bold" "Center" "Center"
    Draw-Text $G "Forgot password" 520 316 400 42 31 $Script:Palette.Ink "Bold" "Center"
    Draw-Text $G "Enter the email linked to your admin account." 540 364 360 48 16 $Script:Palette.Muted "Regular" "Center" "Near" -Wrap
    Draw-Input $G "Email address" "administrator@kalonpos.com" 542 444 356 52
    Draw-Button $G "Send Reset Link" 542 552 356 50 "Primary"
    Draw-Button $G "Back to Sign In" 542 622 356 46 "Secondary"

    Fill-RoundRect $G 542 700 356 48 8 $Script:Palette.GreenSoft
    Draw-Text $G "Reset instructions sent" 562 700 316 48 14 $Script:Palette.Green "Bold" "Center" "Center"
}

function Draw-Dashboard {
    param([System.Drawing.Graphics]$G)

    $area = Draw-Shell $G "Dashboard" "Dashboard" "Live counts, stock movement, and recent sales activity."
    $x = $area.X
    $y = $area.Y

    Draw-StatCard $G "Users" "2" "active staff" $x $y 260 $Script:Palette.Coral $Script:Palette.CoralSoft
    Draw-StatCard $G "Products" "5" "new this week" ($x + 282) $y 260 $Script:Palette.Teal $Script:Palette.TealSoft
    Draw-StatCard $G "Stock items" "416" "available units" ($x + 564) $y 260 $Script:Palette.Blue $Script:Palette.BlueSoft
    Draw-StatCard $G "Sales" "2" "today" ($x + 846) $y 260 $Script:Palette.Green $Script:Palette.GreenSoft

    Draw-Card $G $x ($y + 154) 530 344
    Draw-Text $G "Recently Added Products" ($x + 22) ($y + 174) 300 28 19 $Script:Palette.Ink "Bold"
    $productCols = @(
        @{ Label = "Product"; W = 210 },
        @{ Label = "ID"; W = 90 },
        @{ Label = "Price"; W = 84 },
        @{ Label = "Qty"; W = 64 },
        @{ Label = "By"; W = 82 }
    )
    $productRows = @(
        @("!product!AVOCADO SPRAY GEL SPRIT", "PT046", "GHC24", "14", "N/A"),
        @("!product!BUCUNEER FRAGRANCE SPRAY", "PT047", "GHC30", "10", "N/A"),
        @("!product!SABAON HOLDING SPRAY", "PT048", "GHC30", "15", "N/A"),
        @("!product!FOITEN LACE TINT SPRAY", "PT049", "GHC35", "10", "N/A")
    )
    Draw-Table $G ($x + 18) ($y + 216) 494 $productCols $productRows 54 38

    Draw-Card $G ($x + 570) ($y + 154) 538 344
    Draw-Text $G "Recently Added Sale" ($x + 592) ($y + 174) 300 28 19 $Script:Palette.Ink "Bold"
    $salesCols = @(
        @{ Label = "Sale ID"; W = 88 },
        @{ Label = "Customer"; W = 118 },
        @{ Label = "Total"; W = 86 },
        @{ Label = "Paid"; W = 94 },
        @{ Label = "Balance"; W = 124 }
    )
    $salesRows = @(
        @("AD004", "N/A", "GHC50", "GHC0", "!red!-GHC50"),
        @("AD005", "N/A", "GHC315", "GHC0", "!red!-GHC315"),
        @("AD006", "Adjoa K.", "GHC120", "GHC120", "GHC0"),
        @("AD007", "Walk-in", "GHC35", "GHC20", "!red!-GHC15")
    )
    Draw-Table $G ($x + 588) ($y + 216) 510 $salesCols $salesRows 54 38

    Draw-Card $G $x ($y + 530) 1108 218
    Draw-Text $G "Inventory Health" ($x + 24) ($y + 552) 220 30 20 $Script:Palette.Ink "Bold"
    Draw-Chip $G "416 stock items" ($x + 908) ($y + 552) 138 $Script:Palette.AmberSoft $Script:Palette.Amber
    Draw-Line $G ($x + 32) ($y + 690) ($x + 1058) ($y + 690) $Script:Palette.Line
    $bars = @(180, 240, 126, 300, 222, 388, 336, 420)
    $labels = @("Hair", "Skin", "Nails", "Makeup", "Tools", "Retail", "Spa", "Other")
    for ($i = 0; $i -lt $bars.Count; $i++) {
        $bx = $x + 54 + ($i * 126)
        $bh = $bars[$i] / 5
        Fill-RoundRect $G $bx ($y + 690 - $bh) 54 $bh 8 $Script:Palette.CoralSoft
        Fill-RoundRect $G ($bx + 16) ($y + 690 - ($bh * 0.72)) 22 ($bh * 0.72) 8 $Script:Palette.Coral
        Draw-Text $G $labels[$i] ($bx - 18) ($y + 706) 90 20 12 $Script:Palette.Muted "Regular" "Center"
    }
}

function Draw-ProductsList {
    param([System.Drawing.Graphics]$G)

    $area = Draw-Shell $G "Products" "Products" "View, search, sort, and manage beauty retail inventory."
    Draw-Toolbar $G "Search products..." $area.X $area.Y $area.W "Add Product"

    $cols = @(
        @{ Label = "Image / Name"; W = 250 },
        @{ Label = "Product ID"; W = 120 },
        @{ Label = "Created"; W = 130 },
        @{ Label = "Price"; W = 105 },
        @{ Label = "Qty"; W = 80 },
        @{ Label = "Created by"; W = 140 },
        @{ Label = "Actions"; W = 160 }
    )
    $rows = @(
        @("!product!Arm Rest Mat & Pillow", "PT003", "01/02/2025", "GHC120.00", "4", "N/A", "!actions!"),
        @("!product!ukeby Lace Tint Mousse", "PT004", "01/02/2025", "GHC35.00", "30", "N/A", "!actions!"),
        @("!product!Sonar Pixie", "PT005", "01/02/2025", "GHC120.00", "6", "N/A", "!actions!"),
        @("!product!Sonar dryer SN 1236", "PT006", "01/02/2025", "GHC135.00", "6", "N/A", "!actions!"),
        @("!product!5 in 1Beauty care massager", "PT007", "01/02/2025", "GHC50.00", "20", "N/A", "!actions!"),
        @("!product!Professional head dryer", "PT008", "01/02/2025", "GHC145.00", "6", "N/A", "!actions!"),
        @("!product!Leather Arm rest", "PT009", "01/02/2025", "GHC300.00", "!red!3", "N/A", "!actions!")
    )
    Draw-Table $G $area.X ($area.Y + 72) $area.W $cols $rows 66 46
    Draw-Pagination $G $area.X ($area.Y + 598) $area.W "Showing 1-7 of 28"
}

function Draw-ProductForm {
    param([System.Drawing.Graphics]$G)

    $area = Draw-Shell $G "Products" "Add / Edit Product" "Create inventory records and capture stock changes for audit."

    Draw-Card $G $area.X $area.Y 704 706
    Draw-Text $G "Product Details" ($area.X + 28) ($area.Y + 28) 300 30 22 $Script:Palette.Ink "Bold"
    Draw-Input $G "Product name" "MELLE HAIR SHAMPOO" ($area.X + 28) ($area.Y + 86) 306 52
    Draw-Input $G "Category" "Hair Products" ($area.X + 362) ($area.Y + 86) 306 52
    Draw-Input $G "Price" "GHC120.00" ($area.X + 28) ($area.Y + 184) 200 52
    Draw-Input $G "Quantity" "6" ($area.X + 252) ($area.Y + 184) 200 52
    Draw-Input $G "SKU / Code" "PT023" ($area.X + 476) ($area.Y + 184) 192 52

    Draw-Text $G "Product image" ($area.X + 28) ($area.Y + 292) 220 20 13 $Script:Palette.Muted "Bold"
    Fill-RoundRect $G ($area.X + 28) ($area.Y + 320) 640 188 8 "#FAFBFC"
    Stroke-RoundRect $G ($area.X + 28) ($area.Y + 320) 640 188 8 $Script:Palette.Line
    Fill-RoundRect $G ($area.X + 280) ($area.Y + 356) 136 86 8 $Script:Palette.CoralSoft
    Draw-Text $G "Image upload" ($area.X + 280) ($area.Y + 450) 136 22 15 $Script:Palette.Coral "Bold" "Center"
    Draw-Text $G "PNG or JPG up to 5 MB" ($area.X + 218) ($area.Y + 478) 260 22 13 $Script:Palette.Muted "Regular" "Center"

    Draw-Input $G "Validation example" "8" ($area.X + 28) ($area.Y + 540) 198 52 -ErrorText "Quantity is below reorder level."

    Draw-Button $G "Cancel" ($area.X + 416) ($area.Y + 632) 112 46 "Secondary"
    Draw-Button $G "Save Product" ($area.X + 544) ($area.Y + 632) 124 46 "Primary"

    Draw-Card $G ($area.X + 734) $area.Y 374 360
    Draw-Text $G "Stock Audit Preview" ($area.X + 760) ($area.Y + 28) 250 28 20 $Script:Palette.Ink "Bold"
    Draw-Text $G "Changing quantity from 2 to 6 creates a stock movement entry." ($area.X + 760) ($area.Y + 68) 300 52 14 $Script:Palette.Muted "Regular" "Near" "Near" -Wrap
    Draw-Chip $G "+4 units" ($area.X + 760) ($area.Y + 140) 92 $Script:Palette.GreenSoft $Script:Palette.Green
    Draw-Line $G ($area.X + 760) ($area.Y + 194) ($area.X + 1078) ($area.Y + 194) $Script:Palette.Line
    Draw-Text $G "Inventory log" ($area.X + 760) ($area.Y + 220) 180 24 16 $Script:Palette.Ink "Bold"
    Draw-Text $G "Type: Manual adjustment" ($area.X + 760) ($area.Y + 252) 260 22 14 $Script:Palette.Muted
    Draw-Text $G "By: Administrator" ($area.X + 760) ($area.Y + 280) 260 22 14 $Script:Palette.Muted
}

function Draw-Categories {
    param([System.Drawing.Graphics]$G)

    $area = Draw-Shell $G "Categories" "Product Category List" "View and search product categories."
    Draw-Toolbar $G "Search categories..." $area.X $area.Y $area.W "Add Category"

    $cols = @(
        @{ Label = "Name"; W = 270 },
        @{ Label = "Code"; W = 150 },
        @{ Label = "Created by"; W = 180 },
        @{ Label = "Created"; W = 160 },
        @{ Label = "Products"; W = 128 },
        @{ Label = "Actions"; W = 160 }
    )
    $rows = @(
        @("!bold!accessories", "CT001", "N/A", "01/02/2025", "14", "!actions!"),
        @("!bold!hair tools", "CT002", "N/A", "01/02/2025", "36", "!actions!"),
        @("!bold!BARBAR TOOLS", "CT003", "N/A", "01/04/2025", "12", "!actions!"),
        @("!bold!BARBAR ACCESSORIES", "CT004", "N/A", "01/04/2025", "18", "!actions!"),
        @("!bold!BARBAR PRODUCT", "CT005", "N/A", "01/04/2025", "22", "!actions!"),
        @("!bold!HAIR", "CT006", "N/A", "01/10/2025", "48", "!actions!")
    )
    Draw-Table $G $area.X ($area.Y + 72) $area.W $cols $rows 66 46

    Draw-Card $G ($area.X + 704) ($area.Y + 486) 404 250
    Draw-Text $G "Add Category" ($area.X + 730) ($area.Y + 512) 240 30 21 $Script:Palette.Ink "Bold"
    Draw-Input $G "Category name" "Fragrance" ($area.X + 730) ($area.Y + 570) 162 48
    Draw-Input $G "Code" "FRG" ($area.X + 916) ($area.Y + 570) 166 48
    Draw-Button $G "Cancel" ($area.X + 828) ($area.Y + 676) 104 44 "Secondary"
    Draw-Button $G "Save" ($area.X + 948) ($area.Y + 676) 134 44 "Primary"

    Draw-Button $G "Add Product" $area.X ($area.Y + 682) 136 44 "Secondary"
}

function Draw-SalesList {
    param([System.Drawing.Graphics]$G)

    $area = Draw-Shell $G "Sales" "Sale Management List" "View and search sales, balances, line items, and customer links."
    Draw-Toolbar $G "Search sales..." $area.X $area.Y $area.W "Add Sale"
    Draw-Button $G "25 / page" ($area.X + 664) $area.Y 112 44 "Secondary"

    $cols = @(
        @{ Label = "Sale ID"; W = 84 },
        @{ Label = "Date"; W = 112 },
        @{ Label = "Created by"; W = 90 },
        @{ Label = "Total"; W = 112 },
        @{ Label = "Paid"; W = 112 },
        @{ Label = "Balance"; W = 128 },
        @{ Label = "Customer"; W = 100 },
        @{ Label = "Products(Qty x Price)"; W = 230 },
        @{ Label = "Actions"; W = 140 }
    )
    $rows = @(
        @("AD004", "2025-01-02", "N/A", "GHC50.00", "GHC0.00", "!red!-GHC50.00", "N/A", "5 in 1Beauty care massager", "!actions!"),
        @("AD005", "2025-01-02", "N/A", "GHC315.00", "GHC0.00", "!red!-GHC315.00", "N/A", "T-PINS F, SMF Straightner", "!actions!"),
        @("AD006", "2025-01-10", "Admin", "GHC120.00", "GHC120.00", "GHC0.00", "Ama B.", "MELLE HAIR SHAMPOO", "!actions!"),
        @("AD007", "2025-01-14", "Admin", "GHC35.00", "GHC20.00", "!red!-GHC15.00", "Walk-in", "CANTU SHAMPOO", "!actions!"),
        @("AD008", "2025-01-14", "Admin", "GHC110.00", "GHC110.00", "GHC0.00", "N/A", "CANTU LEAVE-IN", "!actions!"),
        @("AD009", "2025-01-16", "Admin", "GHC30.00", "GHC0.00", "!red!-GHC30.00", "N/A", "SABAON HOLDING SPRAY", "!actions!")
    )
    Draw-Table $G $area.X ($area.Y + 72) $area.W $cols $rows 68 46
    Draw-Pagination $G $area.X ($area.Y + 560) $area.W "Showing 1-6 of 9"
}

function Draw-AddSale {
    param([System.Drawing.Graphics]$G)

    $area = Draw-Shell $G "Sales" "Add New Sale" "Create a sale, update stock, and assign the customer in one transaction."

    Draw-Card $G $area.X $area.Y 690 722
    Draw-Text $G "Sale Items" ($area.X + 28) ($area.Y + 26) 220 30 22 $Script:Palette.Ink "Bold"
    Draw-Input $G "Search Product" "Sonar Pixie" ($area.X + 28) ($area.Y + 78) 398 52
    Draw-Button $G "Add Item" ($area.X + 450) ($area.Y + 102) 134 52 "Primary"

    $cols = @(
        @{ Label = "Product"; W = 238 },
        @{ Label = "Qty"; W = 84 },
        @{ Label = "Unit price"; W = 114 },
        @{ Label = "Line total"; W = 116 },
        @{ Label = ""; W = 88 }
    )
    $rows = @(
        @("!product!CANTU COIL CALM DETANGLER", "1", "GHC120.00", "GHC120.00", "!remove!"),
        @("!product!Sonar Pixie", "1", "GHC120.00", "GHC120.00", "!remove!"),
        @("!product!CANTU SHAMPOO", "1", "GHC35.00", "GHC35.00", "!remove!")
    )
    Draw-Table $G ($area.X + 28) ($area.Y + 184) 640 $cols $rows 66 44

    Draw-Input $G "Paid Price" "GHC200.00" ($area.X + 28) ($area.Y + 492) 196 52
    Draw-Input $G "Select Customer" "-- Select Customer --" ($area.X + 252) ($area.Y + 492) 260 52
    Draw-Button $G "Cancel" ($area.X + 422) ($area.Y + 646) 106 46 "Slate"
    Draw-Button $G "Submit Sale" ($area.X + 544) ($area.Y + 646) 124 46 "Primary"

    Draw-Card $G ($area.X + 730) $area.Y 378 412
    Draw-Text $G "Running Total" ($area.X + 758) ($area.Y + 28) 250 30 22 $Script:Palette.Ink "Bold"
    Draw-Line $G ($area.X + 758) ($area.Y + 88) ($area.X + 1078) ($area.Y + 88) $Script:Palette.Line
    Draw-Text $G "Subtotal" ($area.X + 758) ($area.Y + 118) 140 24 15 $Script:Palette.Muted
    Draw-Text $G "GHC275.00" ($area.X + 890) ($area.Y + 118) 188 24 17 $Script:Palette.Ink "Bold" "Far"
    Draw-Text $G "Amount paid" ($area.X + 758) ($area.Y + 162) 140 24 15 $Script:Palette.Muted
    Draw-Text $G "GHC200.00" ($area.X + 890) ($area.Y + 162) 188 24 17 $Script:Palette.Ink "Bold" "Far"
    Draw-Text $G "Balance" ($area.X + 758) ($area.Y + 206) 140 24 15 $Script:Palette.Muted
    Draw-Text $G "-GHC75.00" ($area.X + 890) ($area.Y + 206) 188 24 19 $Script:Palette.Red "Bold" "Far"
    Fill-RoundRect $G ($area.X + 758) ($area.Y + 270) 320 86 8 $Script:Palette.AmberSoft
    Draw-Text $G "Stock check" ($area.X + 780) ($area.Y + 286) 160 22 15 $Script:Palette.Amber "Bold"
    Draw-Text $G "All selected quantities are available." ($area.X + 780) ($area.Y + 314) 258 26 14 $Script:Palette.Amber
}

function Draw-SaleDetails {
    param([System.Drawing.Graphics]$G)

    $area = Draw-Shell $G "Sales" "Sale Details" "Read-only transaction record with customer and itemized products."

    Draw-Card $G $area.X $area.Y 1108 180
    Draw-Text $G "Sale ID: AD004" ($area.X + 28) ($area.Y + 28) 240 34 24 $Script:Palette.Ink "Bold"
    Draw-Chip $G "Open" ($area.X + 974) ($area.Y + 30) 82 $Script:Palette.RedSoft $Script:Palette.Red
    Draw-Text $G "Customer" ($area.X + 28) ($area.Y + 92) 120 20 13 $Script:Palette.Muted "Bold"
    Draw-Text $G "N/A" ($area.X + 28) ($area.Y + 118) 220 24 17 $Script:Palette.Ink "Bold"
    Draw-Text $G "Date" ($area.X + 284) ($area.Y + 92) 120 20 13 $Script:Palette.Muted "Bold"
    Draw-Text $G "2025-01-02" ($area.X + 284) ($area.Y + 118) 160 24 17 $Script:Palette.Ink "Bold"
    Draw-Text $G "Created by" ($area.X + 504) ($area.Y + 92) 120 20 13 $Script:Palette.Muted "Bold"
    Draw-Text $G "N/A" ($area.X + 504) ($area.Y + 118) 160 24 17 $Script:Palette.Ink "Bold"

    $cols = @(
        @{ Label = "Product"; W = 440 },
        @{ Label = "Qty"; W = 120 },
        @{ Label = "Unit price"; W = 160 },
        @{ Label = "Line total"; W = 160 }
    )
    $rows = @(
        @("!product!5 in 1Beauty care massager", "1", "GHC50.00", "GHC50.00"),
        @("!product!T-PINS F", "1", "GHC15.00", "GHC15.00"),
        @("!product!SMF Straightner", "1", "GHC300.00", "GHC300.00")
    )
    Draw-Table $G $area.X ($area.Y + 214) 880 $cols $rows 66 46

    Draw-Card $G ($area.X + 922) ($area.Y + 214) 186 266
    Draw-Text $G "Totals" ($area.X + 946) ($area.Y + 240) 130 26 20 $Script:Palette.Ink "Bold"
    Draw-Text $G "Grand total" ($area.X + 946) ($area.Y + 300) 120 20 13 $Script:Palette.Muted
    Draw-Text $G "GHC365.00" ($area.X + 946) ($area.Y + 324) 130 28 19 $Script:Palette.Ink "Bold"
    Draw-Text $G "Amount paid" ($area.X + 946) ($area.Y + 372) 120 20 13 $Script:Palette.Muted
    Draw-Text $G "GHC0.00" ($area.X + 946) ($area.Y + 396) 130 26 19 $Script:Palette.Ink "Bold"
    Draw-Text $G "Balance" ($area.X + 946) ($area.Y + 444) 120 20 13 $Script:Palette.Muted
    Draw-Text $G "-GHC365" ($area.X + 946) ($area.Y + 468) 130 26 19 $Script:Palette.Red "Bold"
}

function Draw-EditSale {
    param([System.Drawing.Graphics]$G)

    $area = Draw-Shell $G "Sales" "Update Sale" "Recalculate totals and reconcile stock deltas from edited line items."

    Draw-Card $G $area.X $area.Y 704 706
    Draw-Text $G "Editable Line Items" ($area.X + 28) ($area.Y + 28) 260 30 22 $Script:Palette.Ink "Bold"
    $cols = @(
        @{ Label = "Product"; W = 250 },
        @{ Label = "Old qty"; W = 88 },
        @{ Label = "New qty"; W = 94 },
        @{ Label = "Unit price"; W = 114 },
        @{ Label = ""; W = 98 }
    )
    $rows = @(
        @("!product!5 in 1Beauty care massager", "1", "1", "GHC50.00", "!remove!"),
        @("!product!T-PINS F", "1", "2", "GHC15.00", "!remove!"),
        @("!product!SMF Straightner", "1", "1", "GHC300.00", "!remove!")
    )
    Draw-Table $G ($area.X + 28) ($area.Y + 84) 648 $cols $rows 66 46

    Draw-Input $G "Paid Price" "GHC0.00" ($area.X + 28) ($area.Y + 378) 206 52
    Draw-Input $G "Select Customer" "-- Select Customer --" ($area.X + 260) ($area.Y + 378) 282 52
    Draw-Button $G "Cancel" ($area.X + 428) ($area.Y + 632) 110 46 "Slate"
    Draw-Button $G "Submit Update" ($area.X + 554) ($area.Y + 632) 122 46 "Primary"

    Draw-Card $G ($area.X + 736) $area.Y 372 388
    Draw-Text $G "Stock Reconciliation" ($area.X + 762) ($area.Y + 28) 260 30 21 $Script:Palette.Ink "Bold"
    Draw-Text $G "T-PINS F" ($area.X + 762) ($area.Y + 86) 180 22 15 $Script:Palette.Ink "Bold"
    Draw-Chip $G "-1 stock" ($area.X + 970) ($area.Y + 82) 88 $Script:Palette.RedSoft $Script:Palette.Red
    Draw-Text $G "SMF Straightner" ($area.X + 762) ($area.Y + 138) 180 22 15 $Script:Palette.Ink "Bold"
    Draw-Chip $G "+1 stock" ($area.X + 970) ($area.Y + 134) 88 $Script:Palette.GreenSoft $Script:Palette.Green
    Draw-Line $G ($area.X + 762) ($area.Y + 198) ($area.X + 1078) ($area.Y + 198) $Script:Palette.Line
    Draw-Text $G "New total" ($area.X + 762) ($area.Y + 232) 140 22 15 $Script:Palette.Muted
    Draw-Text $G "GHC380.00" ($area.X + 902) ($area.Y + 232) 154 24 17 $Script:Palette.Ink "Bold" "Far"
    Draw-Text $G "Balance" ($area.X + 762) ($area.Y + 276) 140 22 15 $Script:Palette.Muted
    Draw-Text $G "-GHC380.00" ($area.X + 902) ($area.Y + 276) 154 24 17 $Script:Palette.Red "Bold" "Far"
}

function Draw-Customers {
    param([System.Drawing.Graphics]$G)

    $area = Draw-Shell $G "Customers" "Customers" "Manage client contact details and assign them during checkout."
    Draw-Toolbar $G "Customer name, phone, email" $area.X $area.Y $area.W "Add Customer"

    $cols = @(
        @{ Label = "Name"; W = 230 },
        @{ Label = "Phone"; W = 170 },
        @{ Label = "Email"; W = 270 },
        @{ Label = "Created"; W = 150 },
        @{ Label = "Actions"; W = 160 }
    )
    $rows = @(
        @("!bold!Adjoa Kwarteng", "+233 24 111 9044", "adjoa@example.com", "Jun 4, 2026", "!actions!"),
        @("!bold!Maya Price", "+233 55 812 7711", "maya@example.com", "Jun 9, 2026", "!actions!"),
        @("!bold!Lina Okoro", "+233 20 220 1908", "lina@example.com", "Jun 12, 2026", "!actions!"),
        @("!bold!Abena Sarpong", "+233 27 992 1420", "abena@example.com", "Jun 18, 2026", "!actions!"),
        @("!bold!Walk-in", "-", "-", "System", "!actions!")
    )
    Draw-Table $G $area.X ($area.Y + 72) 980 $cols $rows 66 46

    Draw-Card $G ($area.X + 704) ($area.Y + 486) 404 250
    Draw-Text $G "Edit Customer" ($area.X + 730) ($area.Y + 512) 240 30 21 $Script:Palette.Ink "Bold"
    Draw-Input $G "Name" "Adjoa Kwarteng" ($area.X + 730) ($area.Y + 566) 352 48
    Draw-Input $G "Phone" "+233 24 111 9044" ($area.X + 730) ($area.Y + 650) 166 48
    Draw-Input $G "Email" "adjoa@example.com" ($area.X + 916) ($area.Y + 650) 166 48
}

function Draw-Users {
    param([System.Drawing.Graphics]$G)

    $area = Draw-Shell $G "Users" "Users" "Manage staff accounts, roles, status, and permissions."
    Draw-Toolbar $G "Username or role" $area.X $area.Y $area.W "Add User"

    $cols = @(
        @{ Label = "Username"; W = 240 },
        @{ Label = "Role"; W = 150 },
        @{ Label = "Status"; W = 120 },
        @{ Label = "Last login"; W = 170 },
        @{ Label = "Created"; W = 150 },
        @{ Label = "Actions"; W = 160 }
    )
    $rows = @(
        @("!bold!admin@kalonpos.com", "Owner", "!chip-green!Active", "Jul 1, 2026", "May 1, 2026", "!actions!"),
        @("!bold!manager@kalonpos.com", "Manager", "!chip-green!Active", "Jul 1, 2026", "May 8, 2026", "!actions!"),
        @("!bold!cashier@kalonpos.com", "Cashier", "!chip-green!Active", "Jun 30, 2026", "May 11, 2026", "!actions!"),
        @("!bold!stock@kalonpos.com", "Inventory", "!chip-green!Active", "Jun 29, 2026", "May 12, 2026", "!actions!"),
        @("!bold!temp@kalonpos.com", "Cashier", "!chip-red!Locked", "Jun 2, 2026", "May 24, 2026", "!actions!")
    )
    Draw-Table $G $area.X ($area.Y + 72) 990 $cols $rows 66 46

    Draw-Card $G ($area.X + 704) ($area.Y + 486) 404 278
    Draw-Text $G "Add User" ($area.X + 730) ($area.Y + 512) 240 30 21 $Script:Palette.Ink "Bold"
    Draw-Input $G "Username" "new.staff@kalonpos.com" ($area.X + 730) ($area.Y + 564) 352 48
    Draw-Input $G "Role" "Cashier" ($area.X + 730) ($area.Y + 648) 166 48
    Draw-Input $G "Password" "********" ($area.X + 916) ($area.Y + 648) 166 48
    Draw-Button $G "Save User" ($area.X + 948) ($area.Y + 732) 134 44 "Primary"
}

function Save-Frame {
    param(
        [string]$Name,
        [scriptblock]$Painter
    )

    $bmp = [System.Drawing.Bitmap]::new($Script:CanvasW, $Script:CanvasH)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    & $Painter $g

    $path = Join-Path $OutDir $Name
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bmp.Dispose()

    return $path
}

[System.IO.Directory]::CreateDirectory($OutDir) | Out-Null

$frames = @(
    @{ Name = "01-login.png"; Painter = { param($g) Draw-Login $g } },
    @{ Name = "02-loading.png"; Painter = { param($g) Draw-Loading $g } },
    @{ Name = "03-forgot-password.png"; Painter = { param($g) Draw-ForgotPassword $g } },
    @{ Name = "04-dashboard.png"; Painter = { param($g) Draw-Dashboard $g } },
    @{ Name = "05-products-list.png"; Painter = { param($g) Draw-ProductsList $g } },
    @{ Name = "06-product-form.png"; Painter = { param($g) Draw-ProductForm $g } },
    @{ Name = "07-categories.png"; Painter = { param($g) Draw-Categories $g } },
    @{ Name = "08-sales-list.png"; Painter = { param($g) Draw-SalesList $g } },
    @{ Name = "09-add-sale.png"; Painter = { param($g) Draw-AddSale $g } },
    @{ Name = "10-sale-details.png"; Painter = { param($g) Draw-SaleDetails $g } },
    @{ Name = "11-edit-sale.png"; Painter = { param($g) Draw-EditSale $g } },
    @{ Name = "12-customers.png"; Painter = { param($g) Draw-Customers $g } },
    @{ Name = "13-users.png"; Painter = { param($g) Draw-Users $g } }
)

$written = foreach ($frame in $frames) {
    Save-Frame $frame.Name $frame.Painter
}

$written | ForEach-Object { Write-Host $_ }
