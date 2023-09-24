class ProgressCircleBar {
    constructor(scale, colorEnd, colorStart) {
        this.scale = scale;
        this.colorStart = colorStart;
        this.colorEnd = colorEnd;
        this.element = this.createProgressBar();
        this.maxOffset = 472;
        this.minOffset = 25;
    }

    createProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress_circle_bar');

        progressBar.style.width = +'160px';
        progressBar.style.transform = `scale(${this.scale})`;
        progressBar.style.height = +'160px';

        this.outer = document.createElement('div');
        this.outer.classList.add('outer');
        progressBar.appendChild(this.outer);

        this.inner = document.createElement('div');
        this.inner.classList.add('inner');
        this.inner.textContent = '0%';
        this.outer.appendChild(this.inner);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '160px');
        svg.setAttribute('height', '160px');
        progressBar.appendChild(svg);

        this.circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.circle.style.stroke = '#fff';
        this.circle.setAttribute('cx', '80');
        this.circle.setAttribute('cy', '80');
        this.circle.setAttribute('r', '70');
        this.circle.setAttribute('stroke-linecap', 'round');
        svg.appendChild(this.circle);

        return progressBar;
    }

    setValue(value, interval_ms = 40) {
        if (value < 0 || value > 100) {
            console.error('Value must be between 0 and 100');
            return;
        }

        const totalFrames = 100; // Один кадр на процент

        let currentFrame = 0;
        let currentValue = 0;

        const animate = () => {
            if (currentFrame >= totalFrames) {
                if (value === 100) {
                    this.inner.classList.add('inner-100');
                    this.outer.classList.add('outer-100');
                }
                clearInterval(this.interval);

                this.inner.textContent = `${value}%`;  // Устанавливаем текстовое содержимое равным целевому значению
                return;
            }

            currentValue = (value / totalFrames) * currentFrame;
            const currentOffset = this.maxOffset - ((this.maxOffset - this.minOffset) * (currentValue / 100));
            this.circle.style.strokeDashoffset = currentOffset.toString();
            this.circle.style.stroke = this.interpolateColor(this.colorStart, this.colorEnd, currentValue / 100);
            this.inner.textContent = `${Math.round(currentValue)}%`;

            currentFrame += 1;
        };
        this.interval = setInterval(animate, interval_ms);
    }

    interpolateColor(color1, color2, factor) {
        const r1 = parseInt(color1.substring(1, 3), 16);
        const g1 = parseInt(color1.substring(3, 5), 16);
        const b1 = parseInt(color1.substring(5, 7), 16);

        const r2 = parseInt(color2.substring(1, 3), 16);
        const g2 = parseInt(color2.substring(3, 5), 16);
        const b2 = parseInt(color2.substring(5, 7), 16);

        const r = Math.round(r1 + (r2 - r1) * factor).toString(16).padStart(2, '0');
        const g = Math.round(g1 + (g2 - g1) * factor).toString(16).padStart(2, '0');
        const b = Math.round(b1 + (b2 - b1) * factor).toString(16).padStart(2, '0');

        return '#' + r + g + b;
    }
}

export default ProgressCircleBar;