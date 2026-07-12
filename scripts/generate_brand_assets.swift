import AppKit
import Foundation

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let iconURL = root.appendingPathComponent("ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png")
let splashURLs = [
    root.appendingPathComponent("ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png"),
    root.appendingPathComponent("ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-1.png"),
    root.appendingPathComponent("ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-2.png")
]

func savePNG(_ bitmap: NSBitmapImageRep, to url: URL) {
    guard let data = bitmap.representation(using: .png, properties: [.compressionFactor: 0.92]) else {
        fatalError("Unable to render PNG for \(url.path)")
    }

    try! data.write(to: url)
}

func drawMandala(center: CGPoint, radius: CGFloat, lineWidth: CGFloat, accent: NSColor, gold: NSColor) {
    for ring in [0.34, 0.52, 0.72, 0.92] {
        let r = radius * CGFloat(ring)
        let rect = CGRect(x: center.x - r, y: center.y - r, width: r * 2, height: r * 2)
        let path = NSBezierPath(ovalIn: rect)
        (ring > 0.7 ? gold : accent).withAlphaComponent(ring > 0.7 ? 0.6 : 0.72).setStroke()
        path.lineWidth = lineWidth
        path.stroke()
    }

    for i in 0..<24 {
        let angle = CGFloat(i) * (.pi * 2 / 24)
        let petalRadius = radius * (i % 2 == 0 ? 0.34 : 0.26)
        let x = center.x + cos(angle) * radius * 0.36
        let y = center.y + sin(angle) * radius * 0.36
        let rect = CGRect(x: x - petalRadius / 2, y: y - petalRadius / 2, width: petalRadius, height: petalRadius)
        let petal = NSBezierPath(ovalIn: rect)
        accent.withAlphaComponent(i % 2 == 0 ? 0.28 : 0.18).setStroke()
        petal.lineWidth = lineWidth * 0.75
        petal.stroke()
    }

    for i in 0..<12 {
        let angle = CGFloat(i) * (.pi * 2 / 12)
        let inner = CGPoint(x: center.x + cos(angle) * radius * 0.18, y: center.y + sin(angle) * radius * 0.18)
        let outer = CGPoint(x: center.x + cos(angle) * radius * 0.88, y: center.y + sin(angle) * radius * 0.88)
        let path = NSBezierPath()
        path.move(to: inner)
        path.line(to: outer)
        gold.withAlphaComponent(0.26).setStroke()
        path.lineWidth = lineWidth * 0.55
        path.stroke()
    }
}

func makeBitmap(size: Int, includeWordmark: Bool) -> NSBitmapImageRep {
    let size = CGFloat(size)
    let bitmap = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: Int(size),
        pixelsHigh: Int(size),
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    )!

    let context = NSGraphicsContext(bitmapImageRep: bitmap)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = context

    let bounds = CGRect(x: 0, y: 0, width: size, height: size)
    NSGradient(colors: [
        NSColor(calibratedRed: 0.016, green: 0.024, blue: 0.035, alpha: 1),
        NSColor(calibratedRed: 0.035, green: 0.061, blue: 0.078, alpha: 1),
        NSColor(calibratedRed: 0.012, green: 0.014, blue: 0.024, alpha: 1)
    ])!.draw(in: bounds, angle: 135)

    let accent = NSColor(calibratedRed: 0.431, green: 0.906, blue: 0.718, alpha: 1)
    let gold = NSColor(calibratedRed: 0.969, green: 0.843, blue: 0.541, alpha: 1)
    let violet = NSColor(calibratedRed: 0.545, green: 0.486, blue: 1, alpha: 1)

    for i in 0..<3 {
        let alpha = CGFloat(0.13 - Double(i) * 0.03)
        let r = size * CGFloat(0.62 + Double(i) * 0.22)
        let rect = CGRect(x: size * 0.5 - r / 2, y: size * 0.53 - r / 2, width: r, height: r)
        NSGradient(colors: [accent.withAlphaComponent(alpha), violet.withAlphaComponent(0)])!.draw(in: NSBezierPath(ovalIn: rect), angle: 90)
    }

    let center = CGPoint(x: size / 2, y: includeWordmark ? size * 0.57 : size / 2)
    drawMandala(center: center, radius: size * (includeWordmark ? 0.22 : 0.34), lineWidth: max(2, size * 0.006), accent: accent, gold: gold)

    let coreRadius = size * (includeWordmark ? 0.052 : 0.08)
    NSGradient(colors: [gold, accent])!.draw(in: NSBezierPath(ovalIn: CGRect(x: center.x - coreRadius, y: center.y - coreRadius, width: coreRadius * 2, height: coreRadius * 2)), angle: 45)

    if includeWordmark {
        let paragraph = NSMutableParagraphStyle()
        paragraph.alignment = .center
        let title = "Focus Flow"
        let subtitle = "Neural Harmony"
        title.draw(in: CGRect(x: 0, y: size * 0.26, width: size, height: size * 0.08), withAttributes: [
            .font: NSFont.systemFont(ofSize: size * 0.055, weight: .semibold),
            .foregroundColor: NSColor.white,
            .paragraphStyle: paragraph,
            .kern: size * 0.004
        ])
        subtitle.draw(in: CGRect(x: 0, y: size * 0.205, width: size, height: size * 0.05), withAttributes: [
            .font: NSFont.monospacedSystemFont(ofSize: size * 0.018, weight: .medium),
            .foregroundColor: accent.withAlphaComponent(0.82),
            .paragraphStyle: paragraph,
            .kern: size * 0.005
        ])
    }

    NSGraphicsContext.restoreGraphicsState()
    return bitmap
}

savePNG(makeBitmap(size: 1024, includeWordmark: false), to: iconURL)
for url in splashURLs {
    savePNG(makeBitmap(size: 2732, includeWordmark: true), to: url)
}
