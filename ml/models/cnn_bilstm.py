import torch
import torch.nn as nn

class CNNBiLSTMClassifier(nn.Module):
    """
    Model B: 1D Temporal CNN + BiLSTM for stroke classification.
    Input shape: (batch_size, 30, 528)
    Output shape: (batch_size, 6)
    """
    def __init__(self, input_dim=528, cnn_channels=128, hidden_dim=128, num_layers=2, num_classes=6, dropout=0.3):
        super(CNNBiLSTMClassifier, self).__init__()
        self.conv1 = nn.Conv1d(in_channels=input_dim, out_channels=cnn_channels, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm1d(cnn_channels)
        self.relu1 = nn.ReLU()

        self.conv2 = nn.Conv1d(in_channels=cnn_channels, out_channels=cnn_channels, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm1d(cnn_channels)
        self.relu2 = nn.ReLU()

        self.lstm = nn.LSTM(
            input_size=cnn_channels,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if num_layers > 1 else 0.0
        )

        self.fc1 = nn.Linear(hidden_dim * 2, 64)
        self.relu3 = nn.ReLU()
        self.dropout = nn.Dropout(dropout)
        self.fc2 = nn.Linear(64, num_classes)

    def forward(self, x):
        x_perm = x.permute(0, 2, 1) # (batch, 528, 30)
        c1 = self.relu1(self.bn1(self.conv1(x_perm))) # (batch, 128, 30)
        c2 = self.relu2(self.bn2(self.conv2(c1))) # (batch, 128, 30)

        lstm_in = c2.permute(0, 2, 1) # (batch, 30, 128)
        lstm_out, _ = self.lstm(lstm_in) # (batch, 30, 256)

        out = torch.mean(lstm_out, dim=1) # (batch, 256)
        out = self.fc1(out)
        out = self.relu3(out)
        out = self.dropout(out)
        logits = self.fc2(out) # (batch, 6)
        return logits
